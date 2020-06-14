const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

module.exports.auth = context => {
    
  const authHeader = context.req.headers.authorization;

  if (authHeader) {
    try {
      const user = jwt.verify(authHeader, "SOME PRIVAT KEY");
      return user;
    } catch (err) {
      throw new AuthenticationError("Invalid token");
    }
  } else {
    throw new AuthenticationError("Вы не залогинены");
  }
};
