const User = require('../models/user.model')

exports.allUsers = async function(req, res) {
    try {
        const users = await User.find();

        res.send({ users });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

exports.getUserById = async function(req, res) {
    if (req.params.id === undefined) {
        res.status(400).send({ message: "User id can not be empty!" });
        return;
    }

    try {
        const user = await User.findById(req.params.id);

        res.send({ user });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

exports.createUser = async function(req, res) {
    if (req.body === undefined || req.body.user_name === undefined || !req.body.user_name) {
        res.status(400).send({ message: "User name can not be empty!" });
        return;
    }

    const user = new User({
        user_name: req.body.user_name,
        email: req.body.email,
        password: req.body.password,
        btc_wallet: req.body.btc_wallet,
        ether_wallet: req.body.ether_wallet,
        tron_wallet: req.body.tron_wallet
    })

    try {
        await user.save();

        const users = await User.find();

        res.send({ users });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

exports.updateUserById = async function(req, res) {
    if (req.params.id === undefined || req.body == undefined) {
        res.status(400).send({ message: "User id and content can not be empty!" });
        return;
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body);

        res.send({ user });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}