const mongoose = require('mongoose')

const Schema = mongoose.Schema

const User = new Schema(
    {
        user_name: { type: String },
        email: { type: String },
        password: { type: String },
        btc_wallet: { type: String },
        ether_wallet: { type: String },
        tron_wallet: { type: String }
    },
    {
        collection: "users"
    }
)

module.exports = mongoose.model("users", User)