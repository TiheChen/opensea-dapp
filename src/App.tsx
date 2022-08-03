import React, { useEffect, useMemo, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useMoralis } from "react-moralis";

function App() {
  const {
    Moralis,
    authenticate,
    isAuthenticated,
    isAuthenticating,
    isInitialized,
    isWeb3Enabled,
    enableWeb3,
    user,
    account,
    logout,
  } = useMoralis();

  const [values, setValues] = useState({ tokenAddress: "", tokenId: "" });
  const web3Account = useMemo(
    () => isAuthenticated && user!.get("accounts")[0],
    [user, isAuthenticated]
  );

  const contractHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({...values, tokenAddress: event.target.value});
  }

  const tokenIdHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({...values, tokenId: event.target.value});
  }

  useEffect(() => {
    if (isInitialized) {
      Moralis.initPlugins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled) {
      enableWeb3();
    }
    // esline-disable-next-line
  }, [isAuthenticated])

  const login = async () => {
    if (!isAuthenticated) {
      await authenticate({ signingMessage: "Log in using Moralis" })
        .then((user) => {
          console.log("logged in user:", user);
          console.log(user!.get("ethAddress"));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const logOut = async () => {
    await logout();
    console.log("logged out");
  };

  const getOrder = async () => {
    const response = await Moralis.Plugins.opensea.getOrders({
      network: "testnet",
      tokenAddress: values.tokenAddress,
      tokenId: values.tokenId,
      orderSide: 0, // 0 is Buy, 1 is Sell
      page: 1, // pagination shows 20 orders each page
    });

    console.log(response);
  };

  const getAsset = async () => {
    const response = await Moralis.Plugins.opensea.getAsset({
      network: "testnet",
      tokenAddress: values.tokenAddress,
      tokenId: values.tokenId,
    });
    console.log(response);
  };

  const createBuyOrder = async () => {
    await Moralis.Plugins.opensea.createBuyOrder({
      network: "testnet",
      tokenAddress: values.tokenAddress,
      tokenId: values.tokenId,
      tokenType: "ERC1155",
      amount: 0.5,
      userAddress: web3Account,
      paymentTokenAddress: "0xc778417e063141139fce010982780140aa0cd5ab", // switch the token you want to buy via
    });
  };

  const createSellOrder = async () => {
    // Expire this auction one day from now.
    // Note that we convert from the JavaScript timestamp (milliseconds):
    // const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);

    try {
      const response = await Moralis.Plugins.opensea.createSellOrder({
        network: "testnet",
        tokenAddress: values.tokenAddress,
        tokenId: values.tokenId,
        tokenType: "ERC1155",
        userAddress: web3Account,
        startAmount: 1,
        endAmount: 1,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const fulfillOrder = async () => {
    await Moralis.Plugins.opensea.fulfillOrder({
      network: "testnet",
      userAddress: web3Account,
      order: {},
    });
  };

  return (
    <div className="m-8">
      <h1 className="text-3xl mb-6 text-center">Opensea NFT Dapp!</h1>
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Contract Address" onChange={contractHandler} />
        <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Token Id" onChange={tokenIdHandler} />
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-1 rounded " onClick={login}>Moralis Metamask Login</button>
      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mr-1 rounded" onClick={logOut} disabled={isAuthenticating}>
        Logout
      </button>
      <button className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-1 rounded" onClick={getAsset}>Get Asset</button>
      <button className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-1 rounded" onClick={getOrder}>Get Order</button>
      <button className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-1 rounded" onClick={createSellOrder}>Create Sell Order</button>
    </div>
  );
}

export default App;
