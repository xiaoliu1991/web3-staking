const { ethers } = require("hardhat");

async function main() {

    const [deployer,getter] = await ethers.getSigners();

    const sta = await ethers.getContractFactory("STAToken");
    const STAToken = await sta.deploy("STA", "STA", ethers.parseEther("1010000"));
    await STAToken.waitForDeployment();
    console.log("STAToken deployed to: ", STAToken.target);

    const air = await ethers.getContractFactory("Airdrop");
    const Air = await air.deploy(STAToken.target);
    await Air.waitForDeployment();
    console.log("Air deployed to: ", Air.target);

    const staking = await ethers.getContractFactory("Staking");
    const Staking = await staking.deploy(STAToken.target,STAToken.target,ethers.parseEther("0.0001"),0);//每秒0.0001个
    await Staking.waitForDeployment();
    console.log("Staking deployed to: ", Staking.target);

    //获取部署账户token数量
    let deployBalance = await STAToken.balanceOf(deployer.address);
    console.log("Deploy balance of STAToken: ", ethers.formatEther(deployBalance));

    //给空头账户转账1000个
    let tx = await STAToken.transfer(Air.target, ethers.parseEther("10000"));
    await tx.wait();

    //给质押账户转账1000000个
    tx = await STAToken.transfer(Staking.target, ethers.parseEther("1000000"));
    await tx.wait();

    //获取部署账户token数量
    deployBalance = await STAToken.balanceOf(deployer.address);
    console.log("Deploy balance of STAToken: ", ethers.formatEther(deployBalance));

    //获取空头合约账户token数量
    const balance = await STAToken.balanceOf(Air.target);
    console.log("Airdrop balance of STAToken: ", ethers.formatEther(balance));
    //获取质押合约账户token数量
    const stakingBalance = await STAToken.balanceOf(Staking.target)
    console.log("Staking balance of STAToken: ", ethers.formatEther(stakingBalance));

    // let isClaimed = false;
    // console.log("Airdrop getter with the account:", getter.address);
    // //获取空头领取账户token数量
    // const balanceGetter = await STAToken.balanceOf(getter);
    // console.log("balanceGetter: ", ethers.formatEther(balanceGetter));
    // isClaimed = await Air.checkIsClaim(getter.address);
    // console.log("Airdrop getter is claimed :",isClaimed);
    // //测试使用getter领取空头
    // tx = await Air.connect(getter).claimToken();
    // await tx.wait();
    // isClaimed = await Air.checkIsClaim(getter.address);
    // console.log("Airdrop getter is claimed :",isClaimed);
    // //获取空头账户token数量
    // const balanceAfter = await STAToken.balanceOf(Air.target);
    // console.log("Airdrop balance of STAToken after claimToken: ", ethers.formatEther(balanceAfter));
    // //获取空头领取账户token数量
    // const balanceGetterAfter = await STAToken.balanceOf(getter);
    // console.log("balanceGetterAfter: ", ethers.formatEther(balanceGetterAfter));

    // isClaimed = await Air.checkIsClaim("0x90F79bf6EB2c4f870365E785982E1f101E93b906");
    // console.log("Airdrop getter is claimed :",isClaimed);
    
    // await STAToken.approve(Staking.target,ethers.parseEther("100000"));
    // await Staking.stake(ethers.parseEther("100"));
    // console.log("Staking : ", await Staking.userStaked(deployer.address));

}


main().catch((error)=>{
    console.log(error);
    process.exitCode = 1;
});