const Post = require('../models/post')


/**
 * Get posts in the database.
 * @param {integer} currentPage current page to display.
 * @param {integer} perPage number of items on show per page.
 */
module.exports.getPosts = async (currentPage, perPage) => {
	return await Post.find()
		.populate('creator')
		.sort({ createdAt: -1 })
		.skip((currentPage - 1) * perPage)
		.limit(perPage)
}

/**
 * Get total number of posts in the database.
 */
module.exports.getTotalPosts = async () => {
	return await Post.find().countDocuments()
}


/**
 * Get posts by id.
 * @param {integer} postId id of post to fetch.
 */
module.exports.findById = async postId => {
	return await Post.findById(postId).populate('creator')
}

/**
 * Saves a post in the database.
 * @param {Object} post post object to create.
 * @throws {Error} If the post is not provided.
 */
module.exports.save = async (post) => {
	if (!post) {
		const error = new Error('Missing post')
		error.code = 500
		throw error
	}
	return await post.save();
}

/**
 * Retrieve post by Id.
 * @param {Object} id id of post to retrieve.
 * @throws {Error} If the post is not found.
 */
module.exports.findById = async id => {
	const post = await Post.findById(id).populate('creator')
	if (!post) {
		const error = new Error('Could not retrieve post')
		error.code = 500
		throw error
	}
	return post
}

/**
 * Check if user is creator of post.
 * @param {Object} post post to check.
 * * @param {String} userId id of user to check.
 * @throws {Error} If the product is not provided.
 */
module.exports.isPostOwnedByUser = async (post, userId) => {
	if (post.creator._id.toString() !== userId) {
		const error = new Error('Not authorized to access this post')
		error.code = 403
		throw error
	}
	return true
}


/**
 * Saves a post.
 * @param {Object} post post object to create.
 * @throws {Error} If the post is not provided.
 */
module.exports.delete = async id => {
	return await Post.findByIdAndRemove(id)
}

/**
 * Deletes a post from the database.
 * @param {Object} id post object to delete.
 * @throws {Error} If the post is not provided.
 */
module.exports.delete = async id => {
	return await Post.findByIdAndRemove(id)
}
