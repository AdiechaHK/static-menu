import getConf from './config.js';

const gistUrl = id => "https://api.github.com/gists/" + id;

const getStore = () => {
    let s = window.location.search;
    if (s.length > 0 && s.startsWith('?')) {
        let queryParams = s.substring(1).split('&').map(x => x.split('=')).reduce((qs,ele) =>{
            let [k, v] = ele;
            qs[k] = v;
            return qs;
        }, {});
        if(queryParams.hasOwnProperty('store')) {
            return queryParams.store;
        } else {
            console.error("Please pass store value in the URL");
        }
    }
    else {
        console.error("Store does not specified.")
    }
}

const initApp = () => {

    const storeName = getStore();
    const getLsKey = (k) => `${storeName}_${k}`;
    const { id, filename, contact, msgFormat } = (getConf(storeName));
    const app = new Vue({
        el: "#app",
        data: {
            gistId: id,
            menu: [],
            order: window.localStorage.getItem(getLsKey('order')) ?JSON.parse(window.localStorage.getItem(getLsKey('order'))): [],
            address: window.localStorage.getItem(getLsKey('address')) || '',
            page: 'menu',
            notes: window.localStorage.getItem(getLsKey('notes')) || ''
        },
        computed: {
            total() {
                return this.order.map(li => li.qty * li.amt).reduce((a, b) => a+b, 0)
            },
            totalItems() {
                return this.order.reduce((ttl, li) => ttl+li.qty, 0)
            },
            walink() {
                let text = encodeURI(msgFormat(this.order, this.address, this.notes));
                return `https://wa.me/${contact}?text=${text}`;
            }
        },
        methods: {
            addQty(oi, n) {
                if(oi.qty + n === 0) {
                    if(confirm(`Do you want to remove '${oi.val}'?`)) {
                        this.order = this.order.filter(item => item.val != oi.val)
                        if(this.order.length == 0) this.page = 'menu';
                    } else return;
                }
                oi.qty += n;
                window.localStorage.setItem(getLsKey('order'), JSON.stringify(this.order));
            },
            placeOrder() {
                let verr = null
                // Validate order
                if (this.totalItems <= 0 && this.total <= 0) {
                    verr = "Please add item for make an order.";
                }
                else if (this.address.trim().length <= 0) {
                    verr = "Address is requried to make an order.";
                }

                if(verr) alert(verr);
                else {
                    window.localStorage.setItem(getLsKey('order'), JSON.stringify([]));
                    window.localStorage.setItem(getLsKey('address'), this.address);
                    window.localStorage.setItem(getLsKey('notes'), this.notes);
                    window.location.href = this.walink;
                }
            },
            addItem(item) {
                if (item.title === true) {
                    console.log("Title can't adde to the order.")
                } else {
                    console.log('Yes inside')
                    let {val, amt} = item;
                    let indx = this.order.reduce((fi,li,i) => li.val === val ?i:fi, -1);
                    if (indx === -1) {
                        this.order.push({val, amt, qty:1})
                    } else {
                        this.order[indx]["qty"] += 1;
                    }
                    window.localStorage.setItem(getLsKey('order'), JSON.stringify(this.order));
                }
            }
        },
        created() {
            axios.get(gistUrl(id)).then(({data}) => {
                if(data.files.hasOwnProperty(filename)) {
                    let fileContent = data.files[filename]['content']
                    this.menu = fileContent.split("\n").map(line => {
                        let splitted = line.split(",")
                        if (splitted.length === 1) {
                            return {
                                title: true,
                                val: line
                            }
                        }
                        if (splitted.length === 2) {
                            let [val, amt] = splitted;
                            return {
                                title: false,
                                val,
                                amt 
                            }
                        }
                    });
                } else {
                    console.error("given filename "+filename+" does not present.");
                }
            }).catch(console.error);
        }
    });
}

initApp()