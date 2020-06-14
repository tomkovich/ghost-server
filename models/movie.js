const { model, Schema } = require("mongoose");

const movieSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: Number,
  username: {
    type: String,
    required: [true, "A movie must belong to user"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  file: {
    type: String,
  },
});

module.exports = model("Movie", movieSchema);
