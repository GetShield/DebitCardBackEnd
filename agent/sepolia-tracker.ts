import { ethers } from 'ethers';

import ABI from '../abis/ERC20Abi.json';
import { CHAIN_MAP, TOKEN_MAP, TAGET_WALLET_ADDRESS } from '../config';
import BalanceController from '../controllers/balance.controller';

export const fetchSepoliaEvents = async function () {
  console.log(
    'Sepolia Tracker Started | Target Wallet: ' + TAGET_WALLET_ADDRESS.sepolia
  );
  const provider = new ethers.WebSocketProvider(
    CHAIN_MAP.sepolia.websocket_url
  );

  provider.on('block', async (blockNumber) => {
    const block = await provider.getBlock(blockNumber, true);

    for (const tx of block!.prefetchedTransactions) {
      try {
        if (
          tx.value > 0 &&
          tx.to?.toLowerCase() === TAGET_WALLET_ADDRESS.sepolia.toLowerCase()
        ) {
          let balanceData = {
            blockchain: 'sepolia',
            walletAddress: tx.from,
            to: tx.to,
            amount: Number(ethers.formatEther(tx.value)),
            crypto: 'ETH',
          };

          console.log(`Sepolia Transaction Identified: ${tx.hash}`);
          console.log(balanceData);
          let currentAmount =
            await BalanceController.getAmountByCryptoWalletAndBlockchainInside(
              balanceData
            );

          // get current balance and update
          if (currentAmount instanceof Error) {
            throw currentAmount;
          } else {
            let newAmount = currentAmount.valueOf() + balanceData.amount;
            balanceData['amount'] = newAmount;

            console.log(`New Amount: ${newAmount}`);
            await BalanceController.updateInside(balanceData);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  });

  console.log(`Tracked Tokens: `);
  TOKEN_MAP.sepolia.forEach((token, index) => {
    const name = token.name;
    const address = token.address;
    const decimals = token.decimals;
    console.log(`${name} | address: ${address}`);
    const contract = new ethers.Contract(address, ABI, provider);

    contract.on('Transfer', async (from, to, value, event) => {
      if (to.toLowerCase() == TAGET_WALLET_ADDRESS.sepolia.toLowerCase()) {
        let transferEvent = {
          name: name,
          from: from,
          to: to,
          value: ethers.formatUnits(value, decimals),
        };

        console.log(transferEvent);
      }
    });
  });
};
