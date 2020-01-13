const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const path = require('path')

const feedRoutes = require('./routes/feed');

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({
        message: message
    })
})

mongoose.connect('mongodb://root:cRpZUMjEnWKC0dcB@cluster0-shard-00-00-aylow.mongodb.net:27017,cluster0-shard-00-01-aylow.mongodb.net:27017,cluster0-shard-00-02-aylow.mongodb.net:27017/social_network?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority').then(result => {
    app.listen(8080)
})
