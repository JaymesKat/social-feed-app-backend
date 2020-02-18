const User = require('../models/user')

/**
 * Find user by Id.
 * @param {string} id user id to find.
 */
module.exports.findById = async id => {
	const user = await User.findById(id)
	return user
}

/**
 * Find user by email.
 * @param {string} email user email to find.
 */
module.exports.findByEmail = async email => {
	const user = await User.findOne({ email: email })
	return user
}

/**
 * Saves a user in the database.
 * @param {Object} post post object to create.
 * @throws {Error} If the post is not provided.
 */
module.exports.save = async user => {
	const newUser = await user.save()
	return newUser
}

/**
 * Add Post to User.
 * @param {Object} user user to add post to.
 * @param {Object} post post to add.
 */
module.exports.addPost = async (user, post) => {
	user.posts.push(post)
	const savedUser = await user.save()
	return savedUser
}

/**
 * Remove Post from User's list.
 * @param {String} postId id of post to remove.
 * @param {Object} user affected user.
 */
module.exports.removePost = async (user, postId) => {
	user.posts.pull(postId)
	const savedUser = await user.save()
	return savedUser
}
