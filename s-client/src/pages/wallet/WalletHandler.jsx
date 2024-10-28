import React ,{ useEffect,useState } from "react";
import { ethers } from "ethers";
import { zybContractAddress, zybContractABI,airContractAddress,airContractABI,stakingContractAddress,stakingContractABI } from "../../contract/ContractConfig";

export const WalletHandler = React.createContext();

const getEthereumContract = (contractAddress,contractABI)=>{
    console.log(ethers);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log({
        provider, 
        signer,
        contract
    });
    return {contract,signer};
}


export const WalletHandlerProvider = ({children})=>{

    const[connectedAccount,setConnectedAccount] = useState(null);
    // const[isClaimAirDrop,setIsClaimAirDrop] = useState(false);
    const[isClickClaimAirDrop,setIsClickClaimAirDrop] = useState(false);

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

            if(isClickClaimAirDrop){
                setIsClickClaimAirDrop(false);
                claimAirDrop();
            }
        }catch(error){
            console.log(error);
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
        }
    }

    const handleAccountsChanged = (newAccounts) => {
        if (newAccounts.length > 0) {
            console.log("账户切换",newAccounts);
            setConnectedAccount(newAccounts[0]);
        } else {
            setConnectedAccount(null);
        }
    };

    const handleDisconnect = (error) => {
        setConnectedAccount(null);
        console.log("钱包断开")
    };


    const claimAirDrop = async()=>{
        try{
            if(!connectedAccount){
                setIsClickClaimAirDrop(true);
                connectWallet();
                return;
            }
            //调用合约
            const {contract,signer} = getEthereumContract(airContractAddress,airContractABI);
            const isClaimed = await contract.isClaimed(connectedAccount);
            console.log(isClaimed);
            // if(isClaimed){
            //     alert("已经领取了");
            //     return;
            // }
            // const tx = await contract.claimToken();
            // await tx.wait();
            // console.log(tx);
        }catch(error){
            console.log(error);
        }
    }


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
        <WalletHandler.Provider value={{connectWallet,disconnectWallet,connectedAccount,claimAirDrop}}>
            {children}
        </WalletHandler.Provider>
    );
}