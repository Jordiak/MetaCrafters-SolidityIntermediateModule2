import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositValue, setDepositValue] = useState(0);
  const [withdrawValue, setWithdrawValue] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async () => {
    try {
      if (atm) {
        let tx = await atm.deposit(depositValue);
        await tx.wait()
        getBalance();
      }
    }
    catch {
    }
  }

  const withdraw = async () => {
    try {
      if (atm) {
        let tx = await atm.withdraw(withdrawValue);
        await tx.wait()
        getBalance();
      }
    }
    catch {
    }
  }

  function getDepositValue(val) {
    setDepositValue(val.target.value)
  }

  const toggleDeposit = () => {
    if (showDeposit == true) {
      setShowDeposit(false)
      setDepositValue(0)
    }
    else {
      setShowDeposit(true)
    }
  }

  function getWithdrawValue(val) {
    setWithdrawValue(val.target.value)
  }

  const toggleWithdraw = () => {
    if (showWithdraw == true) {
      setShowWithdraw(false)
      setWithdrawValue(0)
    }
    else {
      setShowWithdraw(true)
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <center>
          <button className="button button-connect" onClick={connectAccount}>CONNECT</button>
        </center>
      )
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div className="contain-transactions blurred">
        <h4>Your Account: {account}</h4>
        <h2>Your Balance: {balance}</h2>
        <div>
          <button className="button button-show-transactions" onClick={toggleDeposit}>Deposit</button>
          {showDeposit && (
            <div>
              <h1>{depositValue}</h1>
              <input className="input-fields" type="text" onChange={getDepositValue} />
              <button className="button button-transactions" onClick={deposit}>Submit</button>
            </div>
          )}
        </div>
        <div>
          <button className="button button-show-transactions" onClick={toggleWithdraw}>Withdraw</button>
          {showWithdraw && (
            <div>
              <h1>{withdrawValue}</h1>
              <input className="input-fields" type="text" onChange={getWithdrawValue} />
              <button className="button button-transactions" onClick={withdraw}>Submit</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <div className="main-div">
      <main>
        <header><div className="blurred"><h1>Please click the CONNECT button to connect to your MetaMask wallet.</h1></div></header>
        {initUser()}
      </main>
    </div>
  )
}