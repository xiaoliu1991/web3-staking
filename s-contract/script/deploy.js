const { ethers } = require("hardhat");

async function main() {

    const [deployer,getter] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const sta = await ethers.getContractFactory("STAToken");
    const STAToken = await sta.deploy("STA", "STA", ethers.parseEther("1000000"));
    await STAToken.waitForDeployment();
    console.log("STAToken deployed to: ", STAToken.target);

    const air = await ethers.getContractFactory("Airdrop");
    const Air = await air.deploy(STAToken.target);
    await Air.waitForDeployment();
    console.log("Air deployed to: ", Air.target);

    const staking = await ethers.getContractFactory("Staking");
    const Staking = await staking.deploy(STAToken.target,STAToken.target,ethers.parseEther("0.01"),0);//每秒0.01个
    await Staking.waitForDeployment();
    const perSecond = await Staking.stakeRewardPerSecond();
    console.log("Staking deployed to: ", Staking.target,"stakeRewardPerSecond:", perSecond);

    //给空头账户转账1000个
    let tx = await STAToken.transfer(Air.target, ethers.parseEther("10000"));
    await tx.wait();
    //获取空头账户token数量
    const balance = await STAToken.balanceOf(Air.target);
    console.log("Airdrop balance of STAToken: ", ethers.formatEther(balance));
    //获取空头领取账户token数量
    const balanceGetter = await STAToken.balanceOf(getter);
    console.log("balanceGetter: ", ethers.formatEther(balanceGetter));
    let isClaimed = await Air.isClaimed(getter.address);
    console.log("Airdrop getter is claimed :",isClaimed);
    //测试使用getter领取空头
    tx = await Air.connect(getter).claimToken();
    await tx.wait();
    isClaimed = await Air.isClaimed(getter.address);
    console.log("Airdrop getter is claimed :",isClaimed);
    //获取空头账户token数量
    const balanceAfter = await STAToken.balanceOf(Air.target);
    console.log("Airdrop balance of STAToken after claimToken: ", ethers.formatEther(balanceAfter));
    //获取空头领取账户token数量
    const balanceGetterAfter = await STAToken.balanceOf(getter);
    console.log("balanceGetterAfter: ", ethers.formatEther(balanceGetterAfter));
}


main().catch((error)=>{
    console.log(error);
    process.exitCode = 1;
});