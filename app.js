const gistUrl = id => "https://api.github.com/gists/" + id;

const initApp = (id, filename) => {
    const app = new Vue({
        el: "#app",
        data: {
            gistId: id,
            menu: [],
            order: [],
            address: ''
        },
        computed: {
            walink() {
                let text = this.order.map(li => `${li.val} - ${li.qty}`).join("\n")
                let finalAmt = this.order.map(li => li.qty * li.amt).reduce((a, b) => a+b, 0)
                text += `\n\nFinal Amount to pay *${finalAmt}*\n\nAddress: ${this.address}`
                const link = "https://wa.me/919033319723?text=" + encodeURI(text)
                return link;
            }
        },
        methods: {
            sendOrderMsg() {
                let text = this.order.map(li => `${li.val} - ${li.qty}`).join("\n")
                let finalAmt = this.order.map(li => li.qty * li.amt).reduce((a, b) => a+b, 0)
                text += `\n\nFinal Amount to pay *${finalAmt}*\n\nAddress: ${this.address}`
                const link = "https://wa.me/919033319723?text=" + encodeURI(text)
                console.log(link)
                window.href = link
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
                }
            }
        },
        created() {
            axios.get(gistUrl(id)).then(({data}) => {
                console.log(data.files)
                if(data.files.hasOwnProperty(filename)) {
                    fileContent = data.files[filename]['content']
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

