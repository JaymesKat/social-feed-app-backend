const mongoose = require('mongoose')

const app = require('../../app')
const request = require('supertest')(app)

describe('User GraphQL endpoint tests', () => {
	let user, connection
	beforeAll(async () => {
		user = {
			email: 'test@example.com',
			password: 'test123',
			name: 'tester'
		}
		connection = await mongoose.connect(global.__MONGO_URI__, {
			useNewUrlParser: true,
			useCreateIndex: true
		})

		await request
			.post('/graphql')
			.set('Content-Type', 'application/json')
			.send({
				query: `mutation {
          createUser(userInput: {email: "${user.email}", password: "${user.password}", name: "${user.name}"}) {
            _id
            email
          }
        }`
			})
	})

	it('creates user', async () => {
		const res = await request
			.post('/graphql')
			.set('Content-Type', 'application/json')
			.send({
				query: `mutation {
          createUser(userInput: {email: "test1@example.com", password: "tester", name: "tester"}) {
            _id
            email
          }
        }`
			})
		expect(res.statusCode).toEqual(200)
		expect(res.body.data.createUser).toHaveProperty('_id')
		expect(res.body.data.createUser).toHaveProperty('email')
	})

	it('should log in valid user', async () => {
		const res = await request
			.post('/graphql')
			.set('Content-Type', 'application/json')
			.send({
				query: `{
          login(email: "${user.email}", password: "${user.password}") {
            userId
            token
          }
        }`
			})
		expect(res.statusCode).toEqual(200)
		expect(res.body.data.login).toHaveProperty('userId')
		expect(res.body.data.login).toHaveProperty('token')
	})

	afterAll(async () => {
		await connection.close()
		await request.close()
	})
})
