const axios = require('axios');

const TRONGRID_API = 'https://api.trongrid.io';
const ADDRESS_TO_MONITOR = 'TR6L3kDBTbzBvXDmffSzwDABMbreeqzsQb';

const REQUEST_CONFIG = 
    { 
        'Content-Type': 'application/json', 
        'TRON-PRO-API-KEY': process.env.TRON_API_KEY || "" 
    }
;

async function monitorAddress() {
    let latestTimestamp = Date.now();

    setInterval(async () => {
        try {
            const response = await axios.get(`${TRONGRID_API}/v1/accounts/${ADDRESS_TO_MONITOR}/transactions?only_to=true&only_confirmed=true`, REQUEST_CONFIG);
            const transactions = response.data.data;

            for (const tx of transactions) {
                const txInfo = await axios.get(`${TRONGRID_API}/v1/transactions/${tx.txID}`);
                const contractData = txInfo.data.raw_data.contract[0].parameter.value;

                console.log('New transaction:');
                console.log('Symbol: TRX'); // TronGrid API does not provide the token symbol, assuming TRX for simplicity
                console.log('From:', contractData.owner_address);
                console.log('To:', contractData.to_address);
                console.log('Amount:', contractData.amount / 1e6); // Convert from sun to TRX

                if (tx.block_timestamp > latestTimestamp) {
                    latestTimestamp = tx.block_timestamp;
                }
            }
        } catch (error) {
            console.error('Error while fetching transactions:', error);
        }
    }, 5000); // Check for new transactions every 5 seconds
}

monitorAddress();