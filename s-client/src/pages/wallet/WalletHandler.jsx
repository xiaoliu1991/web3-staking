import React ,{ useEffect,useState } from "react";
import { ethers } from "ethers";
import { staTokenContractAddress, staTokenContractABI,airContractAddress,airContractABI,stakingContractAddress,stakingContractABI } from "../../contract/ContractConfig";

export const WalletHandler = React.createContext();

const getEthereumContract = async(contractAddress,contractABI)=>{
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    // console.log({
    //     provider, 
    //     signer,
    //     contract
    // });
    return contract;
}


export const WalletHandlerProvider = ({children})=>{

    const[connectedAccount,setConnectedAccount] = useState(null);
    const[stakingTotal,setStakingTotal] = useState(0);
    const[userSTATokenBalancen,setUserSTATokenBalancen] = useState(0);
    const[userStakingTotal,setUserStakingTotal] = useState(0);
    const[userStakingReward,setUserStakingReward] = useState(0);
    const[userShare,setUserShare] = useState("0.00%");
    const[isRefreshUserData,setRefreshUserData] = useState(false);

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
            resetUserData();
        }
    };

    const handleDisconnect = (error) => {
        setConnectedAccount(null);
        resetUserData();
        console.log("钱包断开")
    };


    const claimAirDrop = async()=>{
        try{
            if(!connectedAccount){
                alert("请连接钱包")
                return;
            }
            const contract = await getEthereumContract(airContractAddress, airContractABI);
            const isClaimed = await contract.checkIsClaim(connectedAccount);
            if(isClaimed){
                alert("已经领取空投了");
                return;
            }
            const tx = await contract.claimToken();
            await tx.wait();
            setRefreshUserData(true);
            alert("领取空投成功");
        }catch(error){
            console.log(error);
        }
    }


    const resetUserData = ()=>{
        setUserSTATokenBalancen(0);
        setUserStakingTotal(0);
        setUserStakingReward(0);
        setUserShare("0.00%");
        setStakingTotal(0);
    }

    const refreshUserData = async()=>{
       try{
            if(!connectedAccount){
                return;
            }
            console.log("refreshUserData: ",{connectedAccount});

            let contract = await getEthereumContract(staTokenContractAddress, staTokenContractABI);
            let v = await contract.balanceOf(connectedAccount);
            console.log("balanceOf: ",ethers.formatEther(v));
            setUserSTATokenBalancen(ethers.formatEther(v));

            contract = await getEthereumContract(stakingContractAddress, stakingContractABI);
            const totalStaked = await contract.contractTotalStaked();
            console.log("contractTotalStaked: ",ethers.formatEther(totalStaked));
            setStakingTotal(ethers.formatEther(totalStaked));

            v = await contract.userShares(connectedAccount);
            console.log("userShares: ",ethers.formatEther(v));
            setUserStakingTotal(ethers.formatEther(v));
            if(totalStaked > 0){
                const percentage = ((ethers.formatEther(v) / ethers.formatEther(totalStaked)) * 100).toFixed(2) + '%';
                setUserShare(percentage);
            }else{
                setUserShare("0.00%");
            }
            

            v = await contract.userRewards(connectedAccount);
            console.log("userRewards: ",ethers.formatEther(v));
            setUserStakingReward(ethers.formatEther(v));
       }catch(error){
            console.log(error);
       }
    }

  
    const refreshStakingReward = async()=>{
        try{
            if(!connectedAccount){
                alert("请连接钱包")
                return;
            }
            const contract = await getEthereumContract(stakingContractAddress, stakingContractABI);
            const tx = await contract.calculateReward(connectedAccount);
            await tx.wait();
            const reward = await contract.userRewards(connectedAccount);
            setUserStakingReward(ethers.formatEther(reward));
        }
        catch(error){
            console.log(error);
        }
    }


    const claimStakingReward = async()=>{
        try{
            if(!connectedAccount){
                alert("请连接钱包")
                return;
            }
            const stakingContract = await getEthereumContract(stakingContractAddress, stakingContractABI);
            const tx = await stakingContract.claimReward();
            console.log("claimStakingReward",tx)
            await tx.wait();
            setRefreshUserData(true);
            alert("领奖成功")
        }catch(error){
            console.log(error);
        }
    }

    const withdrawStaking = async()=>{
        try{
            if(!connectedAccount){
                alert("请连接钱包")
                return;
            }
            if(userStakingTotal <= 0)return;
            const stakingContract = await getEthereumContract(stakingContractAddress, stakingContractABI);
            const tx = await stakingContract.withdraw(ethers.parseEther(userStakingTotal));
            await tx.wait();
            setRefreshUserData(true);
            alert("取出成功")
        }catch(error){
            console.log(error);
        }
    }

    
    const executeStaking = async(amount)=>{
        try{
            if(!connectedAccount){
                alert("请连接钱包")
                return;
            }
            const stakingAmount = ethers.parseEther(amount);
            console.log("executeStaking",stakingAmount);
            const tokenContact = await getEthereumContract(staTokenContractAddress, staTokenContractABI);
            const res = await tokenContact.approve(stakingContractAddress,stakingAmount);
            if(res){
                const stakingContract = await getEthereumContract(stakingContractAddress, stakingContractABI);
                const tx = await stakingContract.stake(stakingAmount);
                await tx.wait();
                setRefreshUserData(true);
                alert("质押成功")
            }
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

    useEffect(()=>{
        refreshUserData();
    },[connectedAccount])

    useEffect(()=>{
        if(isRefreshUserData){
            setRefreshUserData(false);
            refreshUserData();
        }
    },[isRefreshUserData])

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
            refreshStakingReward,
            claimStakingReward,
            executeStaking,
            withdrawStaking
        }}>
            {children}
        </WalletHandler.Provider>
    );
}