import React ,{ useEffect,useState } from "react";
import { ethers } from "ethers";
import { staTokenContractAddress, staTokenContractABI,airContractAddress,airContractABI,stakingContractAddress,stakingContractABI } from "../../contract/ContractConfig";

export const WalletHandler = React.createContext();

const getEthereumContract = async(contractAddress,contractABI)=>{
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log({
        provider, 
        signer,
        contract
    });
    return contract;
}


export const WalletHandlerProvider = ({children})=>{

    const[connectedAccount,setConnectedAccount] = useState(null);
    const[stakingTotal,setStakingTotal] = useState(0);
    const[userSTATokenBalancen,setUserSTATokenBalancen] = useState(0);
    const[userStakingTotal,setUserStakingTotal] = useState(0);
    const[userStakingReward,setUserStakingReward] = useState(0);
    const[userShare,setUserShare] = useState("0.00%");

    const checkIfWalletIsConnected = async()=>{
        try{
            if(!window.ethereum) return alert("Please isntall Metamask.")
            const accounts = await window.ethereum.request({method:'eth_accounts'});
            if(accounts.length){
                setConnectedAccount(accounts[0]);
            }else{
                await connectWallet();
            }
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('disconnect', handleDisconnect);
        }catch(error){
            console.log(error);
        }
    }

    const connectWallet = async()=>{
        try{
            if(!window.ethereum) return alert("Please isntall Metamask.")
            const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
            console.log("连接账户",accounts[0]);
            setConnectedAccount(accounts[0]);
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
            resetUserData();
            console.log('连接已断开', res);
        }catch(error){
            console.log(error);
        }
    }

    const handleAccountsChanged = async(newAccounts) => {
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
                connectWallet();
                return;
            }
            //调用合约
            if (window.ethereum == null)
            {
                console.log("MetaMask not installed; using read-only defaults")
            }
            else
            {
                const contract = await getEthereumContract(airContractAddress, airContractABI);
                const isClaimed = await contract.checkIsClaim(connectedAccount);
                if(isClaimed){
                    alert("已经领取了");
                    return;
                }
                const tx = await contract.claimToken();
                await tx.wait();
                console.log(tx);
                alert("领取成功");
            }
        }catch(error){
            console.log(error);
        }
    }


    const resetUserData = ()=>{
        setUserSTATokenBalancen(0);
        setUserStakingTotal(0);
        setUserStakingReward(0);
        setUserShare(0);
    }

    const refreshUserData = async()=>{
        console.log("refreshUserData: ",{connectedAccount});
        if(!connectedAccount){
            connectWallet();
            return;
        }

        let contract = await getEthereumContract(staTokenContractAddress, staTokenContractABI);
        let v = await contract.balanceOf(connectedAccount);
        console.log("balanceOf: ",ethers.formatEther(v));
        setUserSTATokenBalancen(ethers.formatEther(v));

        contract = await getEthereumContract(stakingContractAddress, stakingContractABI);
        const totalStaked = await contract.contractTotalStaked();
        console.log("contractTotalStaked: ",ethers.formatEther(totalStaked));
        setStakingTotal(ethers.formatEther(totalStaked));

        v = await contract.userStaked(connectedAccount);
        console.log("userStaked: ",ethers.formatEther(v));
        setUserStakingTotal(ethers.formatEther(v));

        v = await contract.userShares(connectedAccount);
        console.log("userShares: ",ethers.formatEther(v));
        const percentage = ((ethers.formatEther(v) / ethers.formatEther(totalStaked)) * 100).toFixed(2) + '%';
        setUserShare(percentage);

        // v = await contract.calculateReward(connectedAccount);
        // console.log("calculateReward: ",v);
        // setUserStakingReward(v);
    }


    const claimStakingReward = async()=>{
        const stakingContract = await getEthereumContract(stakingContractAddress, stakingContractABI);
        const tx = await stakingContract.claimReward();
        await tx.wait();
        console.log(tx);
        alert("领奖成功")
    }

    const withdrawStaking = async()=>{
        if(userStakingTotal <= 0)return;
        const stakingContract = await getEthereumContract(stakingContractAddress, stakingContractABI);
        const tx = await stakingContract.withdraw(ethers.parseEther(userStakingTotal));
        await tx.wait();
        console.log(tx);
        alert("取出成功")
    }

    
    const executeStaking = async(v)=>{
        console.log("executeStaking",ethers.parseEther(v));
        const tokenContact = await getEthereumContract(staTokenContractAddress, staTokenContractABI);
        const res = await tokenContact.approve(stakingContractAddress,ethers.parseEther(v));
        if(res){
            const stakingContract = await getEthereumContract(stakingContractAddress, stakingContractABI);
            const tx = await stakingContract.stake(ethers.parseEther(v));
            await tx.wait();
            console.log(tx);
            alert("质押成功")
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
        <WalletHandler.Provider 
        value={{
            connectWallet,
            disconnectWallet,
            connectedAccount,
            claimAirDrop,
            stakingTotal,
            userStakingTotal,
            userSTATokenBalancen,
            userStakingReward,
            userShare,
            refreshUserData,
            claimStakingReward,
            executeStaking,
            withdrawStaking
        }}>
            {children}
        </WalletHandler.Provider>
    );
}