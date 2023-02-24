const defaultMsgFormat = (order, address, notes) => {
    let text = order.map(li => `${li.val} - ${li.qty}`).join("\n")
    let finalAmt = order.map(li => li.qty * li.amt).reduce((a, b) => a+b, 0)
    let n = notes.trim().length > 0 ? `\n\n_Note: ${notes}_`: ''
    return text + `\n\nFinal Amount to pay *₹ ${finalAmt}*${n}\n\nAddress: ${address}`
}

const masterConf = {
    teapost: {
        contact: '919033319723',
        msgFormat: defaultMsgFormat
    },
    nescafe: {
        contact: '919033319723',
        msgFormat: defaultMsgFormat
    },
    shree: {
        title: 'Shree Eatery',
        contact: '919824942719',
        msgFormat: defaultMsgFormat
    },
    cafe24: {
        title: 'Cafe 24',
        contact: '918780546747',
        msgFormat: defaultMsgFormat
    },
    amrit: {
        title: 'Amrit Aahar',
        contact: '919099581663',
        msgFormat: defaultMsgFormat
    },
    rajbhog: {
        title: 'Rajbhog Restorent',
        contact: '916358763387',
        msgFormat: defaultMsgFormat
    },
    teapost2: {
        title: 'Tea Post',
        contact: '919537999117',
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
