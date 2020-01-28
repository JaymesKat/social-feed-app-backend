const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");

const io = require('../socket');
const User = require('../models/user')
const Post = require("../models/post");

exports.getPosts = async (req, res, next) => {
  
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  try {
    const count = await Post.find().countDocuments();
    totalItems = count;
    const posts = await Post.find().populate('creator').sort({ createdAt: -1}).skip((currentPage - 1) * perPage).limit(perPage);
          
    res.status(200)
      .json({
        message: "Posts fetched successfully",
        posts: posts,
        totalItems,
      })
  }
  catch(err) {
    if(!err.statusCode){
      err.statusCode = 500
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
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
  const userId = req.userId;
  
  let creator;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: userId
  });
  
  try{
    await post.save()
    const user = await User.findById(req.userId)
    creator = user;
    user.posts.push(post);
    await user.save();

    io.getIO().emit("posts", { action: "create", post: {...post._doc, creator: { _id: req.userId, name: user.name }} });

    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: { _id: creator._id, name: creator.name}
    })

  } catch(err){
      if(!err.statusCode){
        err.statusCode = 500
      }
      next(err);
    }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;

  try{
    const post = await (await Post.findById(postId)).populate('creator')
    
    if (!post) {
      const error = new Error("Could not find post");
      error.statusCode = "404";
      throw error;
    }
    res.status(200).json({ message: "Post retrieved", post });
  } 
  catch(err) {
    if(!err.statusCode){
      err.statusCode = 500
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
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
  try{
    const post = await Post.findById(postId).populate('creator')
    if (!post) {
        const error = new Error("Could not retrieve post");
        error.statusCode = 500;
        throw error;
      }

      if(post.creator._id.toString() !== req.userId){
        const error = new Error('Not authorized to access this post');
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl != post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      const result = await post.save();
      io.getIO().emit('posts', { action: 'update', post: result })
      res.status(200).json({ message: "Post updated", post: result });
  }
  catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId)
    if (!post) {
      const error = new Error("Could not retrieve post");
      error.statusCode = 500;
      throw error;
    }

    // Check for user
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    io.getIO().emit('posts', { action: 'delete' });

    res.status(200).json({ message: "Post deleted" });
  }
 catch(err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
}

const clearImage = imagePath => {
  let filePath = path.join(__dirname, "..", imagePath);
  fs.unlink(filePath, err => {
    if (err) {
      throw err;
    }
  });
};
