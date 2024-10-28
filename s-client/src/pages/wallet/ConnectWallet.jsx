import React ,{ useEffect,useState } from "react";
import { ethers } from "ethers";

export const ConnectWallet = React.createContext();

const getEthereumContract = ()=>{
    const provider = new ethers.provider.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    console.log({provider,signer});
}


export const ConnectWalletProvider = ({children})=>{

    const[connectedAccount,setConnectedAccount] = useState(null);

    const checkIfWalletIsConnected = async()=>{
        try{
            if(!window.ethereum) return alert("Please isntall Metamask.")

            const accounts = await window.ethereum.request({method:'eth_accounts'});
            console.log(accounts);
    
            if(accounts.length){
                setConnectedAccount(accounts[0]);
            }else{
                console.log("No account found.")
            }

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('disconnect', handleDisconnect);
        }catch(error){
            console.log(error);
            throw new Error("No Ethereum object.")
        }
    }

    const connectWallet = async()=>{
        try{
            if(!window.ethereum) return alert("Please isntall Metamask.")
            const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
            console.log(accounts);
            setConnectedAccount(accounts[0]);
        }catch(error){
            console.log(error);
            throw new Error("No Ethereum object.")
        }
    }


    const disconnectWallet = async()=>{
        try{
            var res = await window.ethereum.request({
                "method": "wallet_revokePermissions",
                "params": [{
                    "eth_accounts": {}
                }]
            });
            setConnectedAccount(null);
            console.log('连接已断开', res);
        }catch(error){
            console.log(error);
            throw new Error("No Ethereum object.")
        }
    }

    const handleAccountsChanged = (newAccounts) => {
        if (newAccounts.length > 0) {
            console.log("账户切换",newAccounts)
            setConnectedAccount(newAccounts[0]);
        } else {
            setConnectedAccount(null);
        }
    };

    const handleDisconnect = (error) => {
        setConnectedAccount(null);
        console.log("钱包断开")
    };


    useEffect(()=>{
        checkIfWalletIsConnected();
        return () => {
            if (window.ethereum) {
              window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
              window.ethereum.removeListener('disconnect', handleDisconnect);
            }
          };
    },[]);

    return(
        <ConnectWallet.Provider value={{connectWallet,disconnectWallet,connectedAccount}}>
            {children}
        </ConnectWallet.Provider>
    );
}