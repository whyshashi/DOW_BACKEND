

const sendResponse = (res, statusCode, success, message, data = null, errors = null) => {
    const responseObj = { success, message, data, errors };

    if (!success) {
        console.log("API Error:", message, errors)
    };

    res.status(statusCode).json(responseObj);
};
//success is boolean
module.exports={sendResponse};
