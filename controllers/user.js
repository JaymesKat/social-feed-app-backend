const User = require("../models/user");

exports.getStatus = async (req, res, next) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId)   
        res.status(200).json({ status: user.status })
    }
    catch(err) {
        if(!err.httpStatusCode){
            err.httpStatusCode = 500
        }
        next(err)
    }
}

exports.updateStatus = async (req, res, next) => {
    const status = req.body.status;
    const userId = req.userId;
    try{
        const user = await User.findById(userId)
        user.status = status;
        const result = await user.save();
        res.status(200).json({ message: "Status updated", status: result.status})
    }
     
    catch(err) {
        if(!err.httpStatusCode){
            err.httpStatusCode = 500
        }
        next(err)
    }
}
