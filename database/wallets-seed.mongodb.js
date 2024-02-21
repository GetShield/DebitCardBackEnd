// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("DebitCardDB");

// Create a new document in the collection.
db.getCollection("wallets").insertMany([
  {
    date: "2022-01-01T00:00:00.000Z",
    address: "TR6L3kDBTbzBvXDmffSzwDABMbreeqzsQb",
    user: "65d50fcc1e48acc505f09b11",
    blockchains: ["65d5cdab296fef2d1539871b", "65d5cdab296fef2d1539871c"],
  },
]);
