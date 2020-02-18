const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const clearImage = require('../utils/image')
const User = require('../models/user')
const Post = require('../models/post')
const PostsService = require('../services/post')
const UsersService = require('../services/user')

const SALT_ROUNDS = 12

module.exports = {
	createUser: async function({ userInput }, req) {
		const errors = []
		if (!validator.isEmail(userInput.email)) {
			errors.push({ message: 'E-mail is invalid' })
		}
		if (
			validator.isEmpty(userInput.password) ||
			!validator.isLength(userInput.password, { min: 5 })
		) {
			errors.push({ message: 'Password is invalid' })
		}
		if (errors.length > 0) {
			const error = new Error('Invalid input')
			error.data = errors
			error.code = 422
			throw error
		}
		const existingUser = await UsersService.findByEmail(userInput.email)

		if (existingUser) {
			const error = new Error('User already exists')
			error.code = 422
			throw error
		}
		const hashedPass = await bcrypt.hash(
			userInput.password,
			bcrypt.genSaltSync(SALT_ROUNDS)
		)
		const user = User({
			email: userInput.email,
			name: userInput.name,
			password: hashedPass
		})
		const createdUser = await UsersService.save(user)
		return { ...createdUser._doc, _id: createdUser._id.toString() }
	},
	login: async function({ email, password }) {
		const user = await UsersService.findByEmail(email)
		if (!user) {
			const error = new Error('User not found')
			error.code = 401
			throw error
		}
		const isEqual = await bcrypt.compare(password, user.password)
		if (!isEqual) {
			const error = new Error('Wrong password')
			error.code = 401
			throw error
		}
		const token = jwt.sign(
			{
				userId: user._id.toString(),
				email: user.email
			},
			'secret_value',
			{ expiresIn: '1h' }
		)
		return { token, userId: user._id.toString() }
	},
	createPost: async function({ postInput }, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated')
			error.code = 401
			throw error
		}
		const errors = []
		if (
			validator.isEmpty(postInput.title) ||
			!validator.isLength(postInput.title, { min: 5 })
		) {
			errors.push({ message: 'Title is invalid' })
		}
		if (
			validator.isEmpty(postInput.content) ||
			!validator.isLength(postInput.content, { min: 5 })
		) {
			errors.push({ message: 'Content is invalid' })
		}
		if (errors.length > 0) {
			const error = new Error('Invalid input')
			error.data = errors
			error.code = 422
			throw error
		}
		const user = await UsersService.findById(req.userId)

		if (!user) {
			const error = new Error('Invalid User')
			error.data = errors
			error.code = 401
			throw error
		}
		const post = new Post({
			title: postInput.title,
			content: postInput.content,
			imageUrl: postInput.imageUrl,
			creator: user
		})

		const createdPost = await PostsService.save(post)
		await UsersService.addPost(user, post)

		return {
			...createdPost._doc,
			_id: createdPost._id.toString(),
			createdAt: createdPost.createdAt.toISOString(),
			updatedAt: createdPost.updatedAt.toISOString()
		}
	},
	updatePost: async function({ id, postInput }, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated')
			error.code = 401
			throw error
		}

		const errors = []
		if (
			validator.isEmpty(postInput.title) ||
			!validator.isLength(postInput.title, { min: 5 })
		) {
			errors.push({ message: 'Title is invalid' })
		}
		if (
			validator.isEmpty(postInput.content) ||
			!validator.isLength(postInput.content, { min: 5 })
		) {
			errors.push({ message: 'Content is invalid' })
		}
		if (errors.length > 0) {
			const error = new Error('Invalid input')
			error.data = errors
			error.code = 422
			throw error
		}
		try {
			const post = await PostsService.findById(id)

			await PostsService.isPostOwnedByUser(post, req.userId)

			post.title = postInput.title
			post.content = postInput.content
			post.imageUrl = postInput.imageUrl

			const updatedPost = await PostsService.save(post)

			return {
				...updatedPost._doc,
				_id: updatedPost._id.toString(),
				createdAt: updatedPost.createdAt.toISOString(),
				updatedAt: updatedPost.updatedAt.toISOString()
			}
		} catch (err) {
			if (!err.code) {
				err.code = 500
			}
			throw err
		}
	},
	deletePost: async function({ id }, req) {
		const post = await PostsService.findById(id)

		await PostsService.isPostOwnedByUser(post, req.userId)

		// Check for user
		clearImage(post.imageUrl)

		await PostsService.delete(id)

		const user = await UsersService.findById(req.userId)
		await UsersService.removePost(user, id)

		return { message: 'Post deleted' }
	},
	posts: async function({ page }, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated')
			error.code = 401
			throw error
		}
		if (!page) {
			page = 1
		}
		const perPage = 2
		const totalPosts = await PostsService.getTotalPosts()
		const posts = await PostsService.getPosts(page, perPage)
		return {
			posts: posts.map(post => {
				return {
					...post._doc,
					_id: post._id.toString(),
					createdAt: post.createdAt.toISOString(),
					updatedAt: post.updatedAt.toISOString()
				}
			}),
			totalPosts
		}
	},
	post: async function({ id }, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated')
			error.code = 401
			throw error
		}

		const post = await PostsService.findById(id)

		if (!post) {
			const error = new Error('Could not find post')
			error.statusCode = '404'
			throw error
		}
		return {
			...post._doc,
			_id: post._id.toString(),
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString()
		}
	},
	userStatus: async function(args, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated')
			error.code = 401
			throw error
		}
		const userId = req.userId
		const user = await UsersService.findById(userId)
		return { message: user.status }
	},
	updateStatus: async function({ status }, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated')
			error.code = 401
			throw error
		}
		const user = await UsersService.findById(req.userId)
		user.status = status
		const updatedUser = await UsersService.save(user)
		return { message: updatedUser.status }
	}
}
