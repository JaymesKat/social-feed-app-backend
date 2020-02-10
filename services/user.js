const User = require('../models/user')

/**
 * Find user by Id.
 * @param {string} id user id to find.
 */
module.exports.findById = async id => {
	return await User.findById(id)
}

/**
 * Find user by email.
 * @param {string} email user email to find.
 */
module.exports.findByEmail = async email => {
	return await User.findOne({ email: email })
}

/**
 * Saves a user in the database.
 * @param {Object} post post object to create.
 * @throws {Error} If the post is not provided.
 */
module.exports.save = async (user) => {
	if (!user) {
		const error = new Error('Missing user')
		error.code = 500
		throw error
	}
	return await user.save();
}

/**
 * Add Post to User.
 * @param {Object} user user to add post to.
 * @param {Object} post post to add.
 */
module.exports.addPost = async (user, post) => {
	user.posts.push(post)
	return await user.save()
}

/**
 * Remove Post from User's list.
 * @param {String} postId id of post to remove.
 * @param {Object} user affected user.
 */
module.exports.removePost = async (user, postId) => {
	user.posts.pull(postId)
	return await user.save()
}
