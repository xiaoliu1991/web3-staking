const { ethers } = require("hardhat");

async function main() {

    const [deployer,getter] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const rw = await ethers.getContractFactory("ZYB");
    const RWToken = await rw.deploy("RW", "RW", ethers.parseEther("1000000"));
    await RWToken.waitForDeployment();
    console.log("RWToken deployed to: ", RWToken.target);

    const air = await ethers.getContractFactory("Airdrop");
    const Air = await air.deploy(RWToken.target);
    await Air.waitForDeployment();
    console.log("Air deployed to: ", Air.target);

    //给空头账户转账1000个
    let tx = await RWToken.transfer(Air.target, ethers.parseEther("10000"));
    await tx.wait();
    //获取空头账户token数量
    const balance = await RWToken.balanceOf(Air.target);
    console.log("Airdrop balance of RWToken: ", ethers.formatEther(balance));
    //获取空头领取账户token数量
    const balanceGetter = await RWToken.balanceOf(getter);
    console.log("balanceGetter: ", ethers.formatEther(balanceGetter));
    //测试使用getter领取空头
    tx = await Air.connect(getter).withdrawTokens();
    await tx.wait();
    //获取空头账户token数量
    const balanceAfter = await RWToken.balanceOf(Air.target);
    console.log("Airdrop balance of RWToken after withdrawTokens: ", ethers.formatEther(balanceAfter));
    //获取空头领取账户token数量
    const balanceGetterAfter = await RWToken.balanceOf(getter);
    console.log("balanceGetterAfter: ", ethers.formatEther(balanceGetterAfter));
}


main().catch((error)=>{
    console.log(error);
    process.exitCode = 1;
});