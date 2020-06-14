const { gql } = require("apollo-server");

module.exports = gql`
  scalar DateTime
  type Movie {
    id: ID!
    title: String
    date: Int
    cover: String
    username: String!
    createdAt: DateTime!
  }
  type User {
    id: ID!
    username: String!
    token: String!
    email: String!
  }

  type Query {
    getMovies: [Movie]
    getMovie(id: ID!): Movie
  }

  input InputRegister {
    email: String!
    password: String!
    confirmPassword: String!
    username: String!
  }

  type Mutation {
    register(inputData: InputRegister!): User!
    login(username: String!, password: String!): User!
    addMovie(title: String!, date: Int, file: String): Movie!
    deleteMovie(id: ID!): Movie!
    updateMovie(id: ID!, date: Int, title: String): Movie!
  }
  type Subscription {
    newMovie: Movie!
  }
`;
