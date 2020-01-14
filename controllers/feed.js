const { validationResult } = require("express-validator");
const Post = require("../models/post");
const path = require("path");
const fs = require("fs");
const errorWithStatus = require("../util/error");

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .then(posts => {
          res
          .status(200)
          .json({
            message: "Posts fetched successfully",
            posts: posts,
            totalItems
          });
        });
    })
    .catch(err => {
      next(errorWithStatus(err));
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, input is incorrect");
    error.statusCode = 422;
    error.data = errors.array()
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;

  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: { name: "James" }
  });
  // Create post in db
  post
    .save()
    .then(result => {
      res.status(201).json({
        message: "Post created successfully!",
        post: result
      });
    })
    .catch(err => {
      next(errorWithStatus(err));
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = "404";
        throw error;
      }
      res.status(200).json({ message: "Post retrieved", post });
    })
    .catch(err => {
      next(errorWithStatus(err));
    });
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, input is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No image picked");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not retrieve post");
        error.statusCode = 500;
        throw error;
      }
      if (imageUrl != post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then(result => {
      res.status(200).json({ message: "Post updated", post: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not retrieve post");
        error.statusCode = 500;
        throw error;
      }

      // Check for user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      res.status(200).json({ message: "Post deleted" });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = imagePath => {
  let filePath = path.join(__dirname, "..", imagePath);
  fs.unlink(filePath, err => {
    if (err) {
      throw err;
    }
  });
};
