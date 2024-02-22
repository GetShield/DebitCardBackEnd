import axios from 'axios';

// Define the interface for the transaction data you expect
interface TransactionDetail {
  inputs: Array<{
    addresses: string[];
  }>;
  outputs: Array<{
    addresses: string[];
    value: number;
  }>;
  txid: string;
}

// Function to fetch transactions for a specific BTC testnet address
async function fetchTransactions(address: string) {
  try {
    const response = await axios.get(
      `https://sochain.com/api/v2/address/BTCTEST/${address}`
    );
    const transactions: TransactionDetail[] = response.data.data.txs;

    transactions.forEach((tx) => {
      tx.inputs.forEach((input) => {
        input.addresses.forEach((originAddress) => {
          tx.outputs.forEach((output) => {
            if (output.addresses.includes(address)) {
              console.log(
                `Origin Wallet: ${originAddress}, Amount: ${
                  output.value / 1e8
                } BTC, TransactionHash: ${tx.txid}`
              );
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

// Replace with the target wallet address
const targetAddress = '2N3BrPtana8j8Mw2T4o42Cpin5TqXzDtdRN';
fetchTransactions(targetAddress);
