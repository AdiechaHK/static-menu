const initApp = (id) => {
    return new Vue({
        el: "#app",
        data: {
            gistId: id
        }
    });
}

