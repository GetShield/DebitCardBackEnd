const mongoose = require('mongoose')

const Schema = mongoose.Schema

const User = new Schema(
    {
        userName: { type: String },
        email: { type: String },
        password: { type: String },
        wallet: { type: String }
    },
    {
        collection: "users"
    }
)

module.exports = mongoose.model("users", User)