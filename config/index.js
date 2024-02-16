const PORT = 8080;
const MONGOURI = "mongodb+srv://shield:rootroot@cluster0.kfkgxdg.mongodb.net/";
const CMC_API_KEY = "9144af3e-0f3a-4cbc-8511-9e6747dd34ab";

const CHAIN_TYPE = {
    BTC: "btc",
    ETH: "eth",
    TRON: "tron"
}

const TOKENS = ["BTC", "ETH", "USDT", "USDC"]

module.exports = {
    PORT, MONGOURI, CMC_API_KEY,
    CHAIN_TYPE, TOKENS
}