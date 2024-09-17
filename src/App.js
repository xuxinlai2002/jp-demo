import React, { useState, useEffect } from 'react';

// UI component to display links to the Particle sites

// BTC Connect related imports
import { useETHProvider, useBTCProvider, useConnectModal } from '@particle-network/btc-connectkit';
import { ethers } from 'ethers';

// Component to display network information
const NetworkInfo = ({ btcNetwork, baseNetwork }) => {
  return (
    <>
      <div className="fixed top-4 right-4 bg-orange-500 text-white p-2 rounded-lg shadow-lg">
        <span className="text-lg font-bold">BTC network: {btcNetwork}</span>
      </div>
      <div className="fixed top-4 left-4 bg-yellow-500 text-black p-2 rounded-lg shadow-lg">
        <span className="text-lg font-bold">Base network: {baseNetwork}</span>
      </div>
    </>
  );
};

// Function to truncate addresses for display
function truncateAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}` : '';
}

const App = () => {
  // Hooks for Ethereum and Bitcoin provider and connect modal
  const { provider, account, chainId } = useETHProvider();
  console.log("xxl 0000 provider : ",provider);
  console.log("xxl 0001 account : ",account);
  console.log("xxl 0002 chainId : ",chainId);
  
  
  const { openConnectModal, disconnect } = useConnectModal();
  const { accounts, sendBitcoin, getNetwork } = useBTCProvider();

  // State variables
  const [balanceEVM, setBalanceEVM] = useState(null);
  const [balanceBTC, setBalanceBTC] = useState(null);
  const [btcNetwork, setBtcNetwork] = useState('');

  const [evmAddress, setEvmAddress] = useState(''); // State to get the address from the UI input
  const [btcAddress, setBtcAddress] = useState(''); // State to get the address from the UI input
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(null); 

  // Initialize custom Ethereum provider— ethers v6 in this case
  // For ethers v5 use: const customProvider = new ethers.providers.Web3Provider(provider, "any");
  // Adapt the other ethers functions to V5 in case
  const customProvider = provider ? new ethers.BrowserProvider(provider, "any") : null;

  // Determine the B^2 network name based on chainId
  const baseNetwork = chainId === 1123 ? 'testnet' : chainId === 223 ? 'mainnet' : 'unknown';



  // Effect to fetch balances and network information when the Bitcoin account changes
  useEffect(() => {
    if (!customProvider || !account || !accounts.length) return;
  
    const fetchBalancesAndNetwork = async () => {
      try {
        // Fetch Ethereum balance
        const balanceResponse = await customProvider.getBalance(account);
        setBalanceEVM(parseFloat(ethers.formatEther(balanceResponse)).toFixed(3));
  
        // Fetch Bitcoin network and balance
        const network = await getNetwork();
        setBtcNetwork(network);
  
        const networkSuffix = network === 'livenet' ? 'main' : 'test3';
        const response = await fetch(`https://api.blockcypher.com/v1/btc/${networkSuffix}/addrs/${accounts[0]}/balance`);
  
        if (response.status === 429) {
          setErrorMessage('Too many requests. Please try again later.');
          return;
        }
  
        const data = await response.json();
        setBalanceBTC(data.balance / 1e8);
      } catch (error) {
        console.error('Error fetching balances or network info:', error);
        setErrorMessage('Error fetching data. Please try again.');
      }
    };
  
    fetchBalancesAndNetwork();
  }, [customProvider, account, accounts, getNetwork]);
  

  // Handler to open connect modal
  const handleLogin = () => {
    if (!accounts.length) {
      openConnectModal();
    }
  };

  // Handler to execute Ethereum transaction
  const executeTxEvm = async () => {
    if (!customProvider) return;

    try {
      console.log("开始执行EVM交易");

      const signer = await customProvider.getSigner();
      const address = await signer.getAddress();

      console.log("账户地址:", address);

      const balance = await customProvider.getBalance(address);
      console.log("账户余额:", ethers.formatEther(balance), "ETH");

      const network = await customProvider.getNetwork();
      console.log("当前网络:", network.name, "chainId:", network.chainId);

      const tx = {
        to: "0x342edA360211772bB63e4420A0704BBaa2f7C410",
        value: "0",
        data: "0x26fe7d9d000000000000000000000000676a37ec9dc13f95133fa86dbc053370a9417d8b0000000000000000000000000000000000000000000000000000000000000001"
      };

      console.log("尝试估算 gas...");
      try {
        const gasEstimate = await customProvider.estimateGas(tx);
        console.log("估算的 gas:", gasEstimate.toString());
        tx.gasLimit = gasEstimate * 120n / 100n; // 使用 BigInt 进行计算
      } catch (gasError) {
        console.error("估算 gas 失败:", gasError);
        console.log("尝试使用固定 gas 限制...");
        tx.gasLimit = ethers.getBigInt("300000"); // 使用 ethers.getBigInt 替代 BigNumber
      }

      console.log("交易详情:", tx);

      const txResponse = await signer.sendTransaction(tx);
      console.log("交易已发送，等待确认...");
      const txReceipt = await txResponse.wait();
      console.log("交易成功。交易哈希:", txReceipt.hash);
    } catch (error) {
      console.error("执行EVM交易时出错:", error);
      if (error.transaction) {
        console.log("失败的交易详情:", error.transaction);
      }
      if (error.receipt) {
        console.log("交易收据:", error.receipt);
      }
      console.log(`交易失败: ${error.message}`);
    }
  };

  // Handler to execute Bitcoin transaction
  const executeTxBtc = async () => {
    try {
      const hash = await sendBitcoin(btcAddress, 1); // Send 1 Sats
      console.log(`交易成功。交易哈希: ${hash}`);
    } catch (error) {
      console.error('执行BTC交易时出错:', error);
    }
  };

  // Handler to copy address to clipboard
  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return ( 
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
      <NetworkInfo btcNetwork={btcNetwork} baseNetwork={baseNetwork} />
      <div className="flex space-x-2 mb-4 bg-slate-100 py-2 px-2 rounded-lg shadow-lg">
  <img src="https://i.imgur.com/EerK7MS.png" alt="Logo 1" className="w-32 h-32 object-contain" />
  <img src="https://i.imgur.com/I3rmeOX.png" alt="Logo 2" className="w-32 h-32 object-contain" />
</div>

      {!account ? (
        <button
          className="flex items-center justify-center bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded-full"
          onClick={handleLogin}
        >
          <img src="https://i.imgur.com/aTxNcXk.png" alt="Bitcoin Logo" className="w-6 h-6 mr-2" />
          Connect
        </button>
      ) : (
        <div className="flex justify-center space-x-4 w-full max-w-5xl mb-8">
          <div className="border border-purple-500 p-6 rounded-lg">
            <div className="w-full p-4 bg-gray-800 rounded-lg mb-4">
              <span className="text-lg font-bold text-white">EVM equivalent generated address</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-semibold text-white">{balanceEVM !== null ? `${balanceEVM} BTC` : 'Loading...'}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{truncateAddress(account)}</span>
                  <button onClick={() => handleCopy(account)} className="text-gray-400 hover:text-white">
                    {copiedAddress === account ? (
                      <span className="text-green-500">Copied!</span>
                    ) : (
                      <span className="text-gray-400 hover:text-white">Copy</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <span className="text-lg text-white mb-2">Send 0.01 BTC to</span>
            <div className="w-full p-4 bg-gray-800 rounded-lg mb-4">
              <label htmlFor="evmAddress" className="text-lg font-bold text-white">Enter EVM Address</label>
              <input
                type="text"
                id="evmAddress"
                className="w-full p-2 mt-2 border border-gray-600 rounded bg-gray-900 text-white"
                value={evmAddress}
                onChange={(e) => setEvmAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>
            <button
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 rounded-full mt-2"
              onClick={executeTxEvm}
            >
              Execute EVM Transaction
            </button>
          </div>
          <div className="border border-purple-500 p-6 rounded-lg">
            <div className="w-full p-4 bg-gray-800 rounded-lg mb-4">
              <span className="text-lg font-bold text-white">BTC Address address</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-semibold text-white">{balanceBTC !== null ? `${balanceBTC} BTC` : (errorMessage || 'Loading...')}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{truncateAddress(accounts[0])}</span>
                  <button onClick={() => handleCopy(accounts[0])} className="text-gray-400 hover:text-white">
                    {copiedAddress === accounts[0] ? (
                      <span className="text-green-500">Copied!</span>
                    ) : (
                      <span className="text-gray-400 hover:text-white">Copy</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <span className="text-lg text-white mb-2">Send 1 Sats to</span>
            <div className="w-full p-4 bg-gray-800 rounded-lg mb-4">
              <label htmlFor="btcAddress" className="text-lg font-bold text-white">Enter BTC Address</label>
              <input
                type="text"
                id="btcAddress"
                className="w-full p-2 mt-2 border border-gray-600 rounded bg-gray-900 text-white"
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
                placeholder="bc1..."
              />
            </div>
            <button
              className="w-full bg-orange-500 hover:bg-orange-800 text-white font-bold py-2 rounded-full mt-2"
              onClick={executeTxBtc}
            >
              Execute BTC Transaction
            </button>
          </div>
        </div>
      )}
      {account && (
        <button
          className="w-32 bg-red-700 hover:bg-red-800 text-white font-bold py-2 rounded-full"
          onClick={disconnect}
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default App;