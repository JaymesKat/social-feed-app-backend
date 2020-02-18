const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const graphqlHttp = require('express-graphql');
const clearImage = require('./utils/image');
const auth = require('./middleware/auth');

const graphqlHttpSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const app = express();

require('dotenv').config()

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  }
  cb(null, false);
};

app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
      );
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if(req.method == 'OPTIONS'){
        return res.sendStatus(200);
      }
      next();
  });

app.use(auth);

app.use(
	"/graphql",
	graphqlHttp({
		schema: graphqlHttpSchema,
		rootValue: graphqlResolver,
		graphiql: true,
		customFormatErrorFn(err) {
			if (!err.originalError) {
				return err;
			}
			const data = err.originalError.data;
			const message = err.message || "An error ocurred";
			const code = err.originalError.code || 500;
			return { message, status: code, data };
		}
	})
);

app.put('/upload-image', (req, res, next) => {
  if(!req.isAuth){
    const error = new Error('Not authenticated');
    error.code = 401;
    throw new error;
  }
  if(!req.file){
    return res.status(200).json({ message: 'No file uploaded' });
  }

  if(req.body.oldPath){
    clearImage(req.body.oldPath);
  }  
  return res.status(201).json({ message: 'File uploaded', filePath: req.file.path });
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data
  res.status(status).json({
    message: message,
    data: data
  });
});

mongoose
  .connect(
    process.env.MONGO_URI)
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));
