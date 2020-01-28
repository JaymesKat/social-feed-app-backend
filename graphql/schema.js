const { buildSchema }  = require('graphql');


module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]
    }
    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }
    input UserInputData {
        email: String!
        name: String!
        password: String!
    }
    type AuthData {
        token: String!
        userId: String!
    }
    type PostData {
        posts: [Post!]
        totalPosts: Int!
    }
    type DeleteMsg {
        message: String!
    }
    type UserStatus{
        message: String!
    }
    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(id: ID!, postInput: PostInputData): Post!
        deletePost(id: ID!): DeleteMsg!
        updateStatus(status: String!): UserStatus!
    }
    type RootQuery {
        login(email: String!, password: String): AuthData!
        posts(page: Int): PostData!
        post(id: ID!): Post!
        userStatus: UserStatus!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
