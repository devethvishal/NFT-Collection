import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract, utils } from "ethers";
import { useState, useEffect, useRef } from "react";
import { CRYPTODEVSCONTRACTADDRESS, abi } from "../constants/index.js";

export default function Home() {
  const [isWalletConnected, setIsWalletConnected] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [numOfNFTMinted, setNumOfNFTMinted] = useState(0);
  const web3ModalRef = useRef();

  const getOwner = async () => {
    try {
      const signer = await getSignerOrProvider(true);
      const nftContract = new Contract(CRYPTODEVSCONTRACTADDRESS, abi, signer);
      const ownerAddress = await nftContract.owner();
      const address = signer.getAddress();
      const myWalletAddress = await address;
      console.log(ownerAddress);
      console.log(myWalletAddress);
      if (myWalletAddress === ownerAddress) {
        setIsOwner(true);
        console.log("I called");
      }
      console.log("getOwner called");
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getSignerOrProvider();
      const nftContract = new Contract(
        CRYPTODEVSCONTRACTADDRESS,
        abi,
        provider
      );
      const hasStrarted = await nftContract.presaleStarted();
      setPresaleStarted(hasStrarted);
      console.log("checkIfPresaleSatarted Called.");
      return hasStrarted;
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getSignerOrProvider();
      const nftContract = new Contract(
        CRYPTODEVSCONTRACTADDRESS,
        abi,
        provider
      );
      const endTime = await nftContract.presaleEnded();

      const hasEnded = endTime.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      console.log("checkIfPresaleEnded Called.");
      return hasEnded;
    } catch (error) {
      console.log(error);
    }
  };

  const getSignerOrProvider = async (isSignerNeeded = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 3) {
      window.alert("Switch your network to ropsten testnet.");
      throw new Error("You are not on ropsten testnet.");
    }
    if (isSignerNeeded) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const startPresale = async () => {
    try {
      const signer = await getSignerOrProvider(true);
      const nftContract = new Contract(CRYPTODEVSCONTRACTADDRESS, abi, signer);
      const tx = await nftContract.startPresale();
      setIsLoading(true);
      await tx.wait();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const presaleMintNFT = async () => {
    setIsLoading(true);
    try {
      const signer = await getSignerOrProvider(true);
      const nftContract = new Contract(CRYPTODEVSCONTRACTADDRESS, abi, signer);
      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      await tx.wait();
      await getNumberOfNFTMinted();
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const mintNFT = async () => {
    setIsLoading(true);
    try {
      const signer = await getSignerOrProvider(true);
      const nftContract = new Contract(CRYPTODEVSCONTRACTADDRESS, abi, signer);
      const tx = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      await tx.wait();
      getNumberOfNFTMinted();
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const getNumberOfNFTMinted = async () => {
    try {
      const signer = await getSignerOrProvider(true);
      const nftContract = new Contract(CRYPTODEVSCONTRACTADDRESS, abi, signer);
      const nftMinted = await nftContract.tokenIds();
      setNumOfNFTMinted(String(nftMinted));
    } catch (error) {
      console.log(error);
    }
  };

  const onPageLoad = async () => {
    try {
      await connectWallet();
      await getOwner();
      const hasStrarted = await checkIfPresaleStarted();
      if (hasStrarted) {
        await checkIfPresaleEnded();
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const signer = await getSignerOrProvider(true);
      setIsWalletConnected(true);
      const account = await signer.getAddress();

      var accountStr = String(account);
      accountStr =
        accountStr.substring(0, 5) + "..." + accountStr.substring(39);
      setAccount(accountStr);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isWalletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "ropsten",
        providerOptions: {},
        disabledInjectedProvider: false,
      });
    }
    onPageLoad();

    const checkStatus = setInterval(async () => {
      const hasStrarted = await checkIfPresaleStarted();
      if (hasStrarted) {
        const hasEnded = await checkIfPresaleEnded();
        if (hasEnded) {
          clearInterval(checkStatus);
        }
      }
    }, 5000);

    setInterval(async () => {
      await getNumberOfNFTMinted();
    }, 5000);
  }, []);

  const renderButton = () => {
    if (isLoading) {
      return <div className={styles.description}>Loading...</div>;
    } else if (!isWalletConnected) {
      return (
        <button className={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      );
    }else if (!presaleStarted && isOwner) {
      return (
        <div>
          <button onClick={startPresale} className={styles.button}>
            Start Presale
          </button>
        </div>
      );
    } else if (presaleStarted && !presaleEnded) {
          return (
            <div>
              <p>
                Presale is Ongoing, You need to be whitelisted to mint NFT now.
              </p>
              <p>{numOfNFTMinted} NFTs have been minted till now.</p>
              <button onClick={presaleMintNFT} className={styles.button}>
                Mint NFT
              </button>
            </div>
          );
        } else if (presaleStarted && presaleEnded) {
          return (
            <div>
              <p>Presale is Ended, Public sale is live now. Mint your NFT.</p>
              <p>{numOfNFTMinted} NFTs have been minted till now.</p>
              <button onClick={mintNFT} className={styles.button}>
                Mint NFT
              </button>
            </div>
          );
        } else {
          return (
            <div>
              <p>Sale is not started yet. Please, come back later.</p>
            </div>
          );
        }
  };

  return (
    <div>
      <Head>
        <title>NFT Collection</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>{account}</div>
        <div>{renderButton()}</div>
      </div>
    </div>
  );
}
