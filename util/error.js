const errorWithStatus = (err) => {
    if(!err.statusCode){
        err.statusCode = 500
        return err
    }
    return err
}

exports.errorWithStatus = errorWithStatus
