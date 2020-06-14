const { model, Schema } = require('mongoose');

const newUser = new Schema({
    username: String,
    password: String,
    email: String
})

module.exports = model('User', newUser)