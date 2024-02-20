require('dotenv').config();
const axios = require('axios');
const tronWeb = require('tronweb');


const TRONGRID_API = 'https://nile.trongrid.io';
const ADDRESS_TO_MONITOR = 'TW7ZnpizoTh3HfKFUHMEDMim8M1LrWXueB';
const REQUEST_INTERVAL = 5000;
const REQUEST_THRESHOLD = 120000; // 2 minutes
const REQUEST_CONFIG = 
    { 
        'Content-Type': 'application/json', 
        'TRON-PRO-API-KEY': process.env.TRON_API_KEY || "" 
    }
;

async function monitorAddress() {
    
    let processedTransactions = new Map();

    setInterval(async () => {
        try {
            const latestTimestamp = Date.now() - REQUEST_THRESHOLD;
            

            const urlRequest = `${TRONGRID_API}/v1/accounts/${ADDRESS_TO_MONITOR}/transactions?only_to=true&only_confirmed=true&min_timestamp=${latestTimestamp}`;
            const response = await axios.get(urlRequest, REQUEST_CONFIG);
            const transactions = response.data.data;
            let countTransactions = 0;
            for (const tx of transactions) {
                if (!processedTransactions.has(tx.txID)){

                    const urlTransaction = `${TRONGRID_API}/wallet/gettransactionbyid`;
                    
                    const payload = {
                        value: tx.txID,
                        visible: true
                    };

                    const txInfo = await axios.post( urlTransaction, payload, REQUEST_CONFIG);
                    const txData = txInfo.data.raw_data.contract[0].parameter.value;

                    console.log('New transaction:');
                    console.log('txID:', tx.txID);
                    console.log('Symbol: TRX'); // TronGrid API does not provide the token symbol, assuming TRX for simplicity
                    console.log('From:', txData.owner_address);
                    console.log('To:', txData.to_address);
                    console.log('Amount:', txData.amount / 1e6); // Convert from sun to TRX
                    console.log('processed Transactions So Far:', countTransactions);
                    console.log();

                    // TODO verify it is working 
                    // Check if the transaction is a token transfer
                    if (txData.hasOwnProperty('asset_name')) {
                        console.log('Token Transfer:');
                        console.log('Token Name:', txData.asset_name);
                        console.log('Token Amount:', txData.amount / 1e6); // Convert from sun to token amount
                        console.log();
                    }
                    
                    processedTransactions.set(tx.txID, true);
                    countTransactions++;
                }
            }
        } catch (error) {
            console.error('Error while fetching transactions:', error);
        }
    }, REQUEST_INTERVAL); // Check for new transactions every 5 seconds
}

monitorAddress();