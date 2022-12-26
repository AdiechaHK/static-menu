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

    const { id, filename, contact, msgFormat } = (getConf(getStore()))

    console.log(id, filename, contact)

    const app = new Vue({
        el: "#app",
        data: {
            gistId: id,
            menu: [],
            order: [],
            address: '',
            page: 'menu',
            notes: ''
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