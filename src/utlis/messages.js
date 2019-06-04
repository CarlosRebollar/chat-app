const generatedMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    };
};

const generateLocationMessage = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    };
};

module.exports = {
    generatedMessage,
    generateLocationMessage
};