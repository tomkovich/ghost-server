const { ApolloServer, PubSub } = require("apollo-server");
const resolvers = require("./resolvers/index.js");
const typeDefs = require("./typeDefs.js");
var mongoose = require("mongoose");
mongoose.set("useUnifiedTopology", true);
require('dotenv').config();

var pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

mongoose
  .connect(
    "mongodb+srv://oxxxymiron:admin12345@cluster0-b6sfv.mongodb.net/oxxxy?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log(`MONGODB connected`);
    return server.listen({ port: process.env.PORT || 8080});
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch((err) => {
    console.error(err);
  });
