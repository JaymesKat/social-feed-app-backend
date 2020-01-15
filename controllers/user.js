const User = require("../models/user");

exports.getStatus = (req, res, next) => {
    const userId = req.userId;
    User.findById(userId)
        .then(user => {
            res.status(200).json({ status: user.status })
        })
        .catch(err => {
            if(!err.httpStatusCode){
                err.httpStatusCode = 500
                next(err)
            }
        })
}

exports.updateStatus = (req, res, next) => {
    const status = req.body.status;
    const userId = req.userId;
    User.findById(userId)
        .then(user => {
            user.status = status;
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: "Status updated", status: result.status})
        })
        .catch(err => {
            if(!err.httpStatusCode){
                err.httpStatusCode = 500
                next(err)
            }
        })
}
