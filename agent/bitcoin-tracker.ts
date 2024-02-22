const axios = require('axios');

const bitcoinAddress = '2N3BrPtana8j8Mw2T4o42Cpin5TqXzDtdRN';

const apiUrl = `https://api.blockcypher.com/v1/btc/main/addrs/${bitcoinAddress}/full?limit=50`;

async function checkTransactions() {
  try {
    const response = await axios.get(apiUrl);
    const transactions = response.data.txs;

    if (transactions.length > 0) {
      console.log(
        `Found ${transactions.length} transactions for address ${bitcoinAddress}`
      );
      // Process transactions here
      transactions.forEach((tx: any) => {
        console.log(`Transaction hash: ${tx.hash}`);
        // Add more detailed processing per transaction as needed
      });
    } else {
      console.log(`No transactions found for address ${bitcoinAddress}`);
    }
  } catch (error) {
    console.error(`Error fetching transactions: ${error}`);
  }
}

// Check for new transactions every 6 seconds
setInterval(checkTransactions, 6000);
