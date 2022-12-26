const defaultMsgFormat = (order, address, notes) => {
    let text = order.map(li => `${li.val} - ${li.qty}`).join("\n")
    let finalAmt = order.map(li => li.qty * li.amt).reduce((a, b) => a+b, 0)
    let n = notes.trim().length > 0 ? `\n\n${notes.trim()}`: ''
    return text + `\n\nFinal Amount to pay *${finalAmt}*${notes}\n\nAddress: ${address}`
}

const masterConf = {
    teapost: {
        contact: '919033319723',
        msgFormat: defaultMsgFormat
    },
    nescafe: {
        contact: '919033319723',
        msgFormat: defaultMsgFormat
    }
}

const getConf = name => {
    if (masterConf.hasOwnProperty(name)) {
        return {
            id: '77808af6ad9bf5d35240baaae9d5f8ba', // GistID
            filename: name + '.csv',
            ...masterConf[name]
        };
    } else {
        console.error("Invalid config, or config not found with the name " + name)
    }
}

export default getConf;