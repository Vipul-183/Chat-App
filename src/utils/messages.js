
const messageFunction = (username, message)=>{
    return {
        username,
        message,
        time: new Date().getTime()
    }
}

const generateLocationMessage = (username, url)=>{
    return {
        username,
        url,
        time: new Date().getTime()
    }
}

module.exports = {
    messageFunction,
    generateLocationMessage
}