import getConf from "./config.js";

const gistUrl = (id) => "https://api.github.com/gists/" + id;

const getStore = () => {
  let s = window.location.search;
  if (s.length > 0 && s.startsWith("?")) {
    let queryParams = s
      .substring(1)
      .split("&")
      .map((x) => x.split("="))
      .reduce((qs, ele) => {
        let [k, v] = ele;
        qs[k] = v;
        return qs;
      }, {});
    if (queryParams.hasOwnProperty("store")) {
      return queryParams.store;
    } else {
      console.error("Please pass store value in the URL");
    }
  } else {
    console.error("Store does not specified.");
  }
};

const initApp = () => {
  const storeName = getStore();
  const getLsKey = (k) => `${storeName}_${k}`;
  const { id, filename, contact, msgFormat } = getConf(storeName);
  const app = new Vue({
    el: "#app",
    data: {
      gistId: id,
      menu: [],
      search: '',
      order: window.localStorage.getItem(getLsKey("order"))
        ? JSON.parse(window.localStorage.getItem(getLsKey("order")))
        : [],
      address: window.localStorage.getItem(getLsKey("address")) || "",
      page: "menu",
      notes: window.localStorage.getItem(getLsKey("notes")) || "",
      isItemAddedToCart: false,
      credit: false,
      sending: false
    },
    computed: {
      filtered_menu() {
        return this.menu.filter(a => a.val.toLowerCase().indexOf(this.search.toLowerCase()) != -1);
      },
      itemCount() {
        return this.order.reduce((r,i) => {
          r[i.val] = i.qty
          return r
        }, {}); 
      },
      total() {
        return this.order
          .map((li) => li.qty * li.amt)
          .reduce((a, b) => a + b, 0);
      },
      totalItems() {
        return this.order.reduce((ttl, li) => ttl + li.qty, 0);
      },
      walink() {
        let text = encodeURI(msgFormat(this.order, this.address, this.notes));
        return `https://wa.me/${contact}?text=${text}`;
      },
    },
    methods: {
    
      removeAll() {
        if (
          confirm(
            "Are you sure you want to remove all " + this.totalItems + " itmes?"
          )
        ) {
          this.order = [];
          window.localStorage.setItem(
            getLsKey("order"),
            JSON.stringify(this.order)
          );
          this.page = "menu";
        }
      },
      addQty(oi, n) {
        if (oi.qty + n === 0) {
          if (confirm(`Do you want to remove '${oi.val}'?`)) {
            this.order = this.order.filter((item) => item.val != oi.val);
            if (this.order.length == 0) this.page = "menu";
          } else return;
        }
        oi.qty += n;
        window.localStorage.setItem(
          getLsKey("order"),
          JSON.stringify(this.order)
        );
      },
      placeOrder() {
        let verr = null;
        // Validate order
        if (this.totalItems <= 0 && this.total <= 0) {
          verr = "Please add item for make an order.";
        } else if (this.address.trim().length <= 0) {
          verr = "Address is requried to make an order.";
        }

        if (verr) alert(verr);
        else {
          // console.log(msgFormat(this.order, this.address, this.notes))
          this.sending = true
          const redirectToWa = () => {
            window.localStorage.setItem(getLsKey("order"), JSON.stringify([]));
            window.localStorage.setItem(getLsKey("address"), this.address);
            window.localStorage.setItem(getLsKey("notes"), this.notes);
            window.location.href = this.walink;
          }

          fetch('https://discord.com/api/webhooks/1057252433711087668/50weA4aBLMPM3d43xotKKc7K5UYqNARfEnSnlJWsrhnlyIEipEcKpDPlh2faJahoCxOg', {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
              username: storeName || 'Default store',
              content: `We get new order of ₹${this.total}.`,
            })
          }).then(res => {
            console.log(res);
            axios.post("https://1moy5z33sa.execute-api.us-east-1.amazonaws.com/dev/orders", {
              storeName,
              order: this.order,
              address: this.address,
              notes: this.notes,
              amount: this.total,
              item_count: this.totalItems
            }).then(redirectToWa).catch(console.error)
          }) 
        }
      },
      addItem(item) {
        if (item.title === true) {
          console.log("Title can't adde to the order.");
        } else {
          this.isItemAddedToCart = true;
          let { val, amt } = item;
          let indx = this.order.reduce(
            (fi, li, i) => (li.val === val ? i : fi),
            -1
          );
          if (indx === -1) {
            this.order.push({ val, amt, qty: 1 });
          } else {
            this.order[indx]["qty"] += 1;
          }
          window.localStorage.setItem(
            getLsKey("order"),
            JSON.stringify(this.order)
          );
          setTimeout(() => {
            this.isItemAddedToCart = false;
          }, 500);
        }
      },
    },
    created() {
      axios
        .get(gistUrl(id))
        .then(({ data }) => {
          if (data.files.hasOwnProperty(filename)) {
            let fileContent = data.files[filename]["content"];
            this.menu = fileContent.split("\n").map((line) => {
              let splitted = line.split(",");
              if (splitted.length === 1) {
                return {
                  title: true,
                  val: line,
                };
              }
              if (splitted.length === 2) {
                let [val, amt] = splitted;
                return {
                  title: false,
                  val,
                  amt,
                };
              }
            });
          } else {
            console.error("given filename " + filename + " does not present.");
          }
        })
        .catch(console.error);
    },
  });
};

initApp();