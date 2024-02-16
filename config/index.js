const PORT = 8080;
const MONGOURI = "mongodb+srv://shield:rootroot@cluster0.kfkgxdg.mongodb.net/";

const CHAIN_TYPE = {
    BTC: "btc",
    ETH: "eth",
    TRON: "tron"
}

module.exports = {
    PORT, MONGOURI, CHAIN_TYPE
}