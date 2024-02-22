import axios from 'axios';
require('dotenv').config();

const getBlockApiKey = process.env.GETBLOCK_BTC_TESTNET;
const btcTestnetUrl = 'https://btc.getblock.io/testnet/'; // GetBlock.io Bitcoin Testnet URL

interface RpcResponse {
  result: any;
  error: any;
  id: number;
}

async function makeRpcCall(
  method: string,
  params: any[] = []
): Promise<RpcResponse> {
  try {
    const response = await axios.post(
      btcTestnetUrl,
      {
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      },
      {
        headers: {
          'x-api-key': getBlockApiKey || '', // Ensure getBlockApiKey is defined
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('RPC call failed:', error);
    return { result: null, error, id: 0 };
  }
}

makeRpcCall();
