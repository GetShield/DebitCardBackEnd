import axios from 'axios';

// Configuration
const addressMainnet = '32KjG6o7TFcYyvHWADpg1m4JoXU4P5QN1L'; // Replace with the wallet address you want to monitor on the mainnet
const addressTestnet = '2N3BrPtana8j8Mw2T4o42Cpin5TqXzDtdRN'; // Replace with the wallet address you want to monitor on the testnet
const pollingInterval = 60000; // 60 seconds

// Function to fetch and display transactions for a given address
async function fetchTransactions(network: 'mainnet' | 'testnet') {
  const address: string =
    network === 'mainnet' ? addressMainnet : addressTestnet;
  const baseUrl =
    network === 'mainnet'
      ? `https://blockstream.info/api/address/${address}/txs`
      : `https://blockstream.info/testnet/api/address/${address}/txs`;

  try {
    const response = await axios.get(baseUrl);
    const transactions = response.data;
    if (transactions.length > 0) {
      transactions.forEach((tx: any) => {
        console.log(`Transaction Hash: ${tx.txid}`);
        tx.vin.forEach((input: any) => {
          console.log(
            `From: ${input.prevout.scriptpubkey_address || 'Unknown'}`
          );
        });
        tx.vout.forEach((output: any) => {
          if (output.scriptpubkey_address === address) {
            console.log(
              `To: ${output.scriptpubkey_address}, Amount: ${
                output.value / 1e8
              } BTC`
            );
          }
        });
      });
    } else {
      console.log('No new transactions found.');
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

// Polling function
function startPolling() {
  fetchTransactions('mainnet');
  fetchTransactions('testnet');
  setTimeout(startPolling, pollingInterval);
}

// Start monitoring
startPolling();
