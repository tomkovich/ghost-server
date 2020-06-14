const jwt = require("jsonwebtoken");
const { GraphQLScalarType } = require("graphql");

const Movie = require("../models/movie");
const User = require("../models/user");
const {
  UserInputError,
  AuthenticationError,
  ApolloError,
} = require("apollo-server");
const { validateLogin } = require("../helper/validate");
const { validateRegister } = require("../helper/validate");
const { auth } = require("../helper/auth");

var generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    "SOME PRIVAT KEY",
    { expiresIn: "1h" }
  );

module.exports = {
  Query: {
    async getMovies() {
      try {
        const movies = await Movie.find().sort();
        return movies;
      } catch (err) {
        console.log(err);
      }
    },
    async getMovie(_, { id }) {
      try {
        const movie = await Movie.findById(id);
        return movie;
      } catch (err) {
        console.log(err);
      }
    },
  },
  Mutation: {
    async addMovie(_, args, context) {
      const user = auth(context);
      try {
        var newMovie = new Movie({
          ...args,
          username: user.username,
        });
        var movie = await newMovie.save();
        context.pubsub.publish("NEW_MOVIE", {
          newMovie: movie,
        });
        return movie;
      } catch (err) {
        throw new ApolloError("A Movie must have title");
      }
    },
    async deleteMovie(_, { id }, context) {
      const user = auth(context);

      try {
        const movie = await Movie.findById(id);
        if (user.username === movie.username) {
          await movie.delete();
          return "Movie deleted";
        } else {
          throw new AuthenticationError("Действие запрещено");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async updateMovie(_, args, context) {
      const user = auth(context);

      try {
        const movie = await Movie.findById(args.id);

        if (user.username === movie.username) {
          let title = args.title !== undefined ? args.title : movie.title;
          let date = args.date !== undefined ? args.date : movie.date;

          await movie.updateOne({
            title,
            date,
          });

          return movie;
        } else {
          throw new AuthenticationError("Действие запрещено");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async register(
      _,
      { inputData: { username, password, confirmPassword, email } }
    ) {
      const { errors, validate } = validateRegister(
        username,
        password,
        confirmPassword,
        email
      );
      const user = await User.findOne({ username });

      if (validate) {
        throw new UserInputError("Произошла ошибка", { errors });
      }

      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }

      const newUser = new User({
        username,
        email,
        password,
      });

      const result = await newUser.save();

      const token = generateToken(result);

      return {
        ...result._doc,
        id: result._id,
        token,
      };
    },
    async login(_, { username, password }) {
      const { errors, validate } = validateLogin(username, password);

      var user = await User.findOne({ username });

      if (validate) {
        throw new UserInputError("Произошла ошибка", { errors });
      }

      if (!user) {
        errors.general = "Пользователь не найден";
        throw new UserInputError("Пользователь не найден", { errors });
      }

      var match = password === user.password && true;

      if (!match) {
        errors.general = "Пароль не совпадает";
        throw new UserInputError("Пароль не совпадает", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
  },
  Subscription: {
    newMovie: {
      subscribe: (_, __, context) => context.pubsub.asyncIterator("NEW_MOVIE"),
    },
  },
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "A date and time, represented as an ISO-8601 string",
    serialize: (value) => value.toISOString(),
    parseValue: (value) => new Date(value),
    parseLiteral: (ast) => new Date(ast.value),
  }),
};
