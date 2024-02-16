const Wallet = require('../models/wallet.model')
const config = require('../config')

const { validate } = require('bitcoin-address-validation');
const TronWeb = require('tronweb')
const { ethers } = require('ethers')

exports.getWalletByAddress = async function (req, res) {
    if (req.params.address === undefined) {
        res.status(400).send({ message: "Wallet address is empty!" });
        return;
    }

    try {
        const wallet = await Wallet.findOne({ address: req.params.address });

        res.send({ wallet });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

exports.createWallet = async function (req, res) {
    if (req.body === undefined || req.body.address === undefined || req.body.chain_type === undefined) {
        res.status(400).send({ message: "Wallet address or Chain Type can not be empty!" });
        return;
    }
    if (req.body.chain_type === config.CHAIN_TYPE.BTC && !validate(req.body.address)) {
        res.status(400).send({ message: "Bitcoin address is not valid address!" });
        return;
    }
    if (req.body.chain_type === config.CHAIN_TYPE.ETH && !ethers.isAddress(req.body.address)) {
        res.status(400).send({ message: "Ethereum address is not valid address!" });
        return;
    }
    if (req.body.chain_type === config.CHAIN_TYPE.TRON) {
        const tronWeb = new TronWeb({
            fullHost: "https://api.trongrid.io"
        });
        if (!tronWeb.isAddress(req.body.address)) {
            res.status(400).send({ message: "Tron address is not valid address!" });
            return;
        }
    }

    const wallet = new Wallet({
        address: req.body.address,
        chain_type: req.body.chain_type,
        token_type: req.body.token_type,
        balance: "0"
    })

    try {
        await wallet.save();

        const result = await Wallet.findOne({ address: wallet.address });

        res.send({ wallet: result });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

exports.updateBalanceByAddress = async function (req, res) {
    if (req.params.address === undefined || req.body === undefined || !req.body.balance) {
        res.status(400).send({ message: "Wallet address or balance can not be empty!" });
        return;
    }

    try {
        const wallet = await Wallet.findOneAndUpdate({ address: req.params.address}, { balance: req.body.balance });

        const result = await Wallet.findOne({ address: wallet.address });

        res.send({ wallet: result });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}