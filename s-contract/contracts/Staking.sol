// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./STAToken.sol";

contract Staking {
    STAToken public stakingToken;
    STAToken public rewardToken;

    uint256 public contractTotalShares; // 系统的总份额
    uint256 public contractTotalStaked; // 系统的总质押金额
    uint256 public stakeRewardPerSecond;// 质押每秒奖励

    mapping(address => uint256) public userShares; // 每个用户的份额
    mapping(address => uint256) public userStaked; // 每个用户的质押金额
    mapping(address => uint256) public userStakedStartTime;//每个用户开始质押的时间

    event Staked(address indexed user, uint256 amount);//质押事件
    event ClaimReward(address indexed user, uint256 amount);//领取奖励事件
    event Withdrawn(address indexed user, uint256 amount);//提取事件

    constructor(
        STAToken _stakingToken,
        STAToken _rewardToken,
        uint256 _rewardPerSecond,
        uint256 _amount
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        stakeRewardPerSecond = _rewardPerSecond;
        rewardToken.mint(address(this), _amount);
    }


    //用户质押函数
    function stake(uint256 amount) external {
        require(amount > 0 ,"amount must be greater than 0");
        //如果系统总份额等0，说明还没有人质押,直接用当前金额作为份额
        //如果有人质押，使用份额计算公式：质押金额*当前总份额/总质押量
        uint256 share = 0;
        if(contractTotalShares == 0){
            share = amount;
        }else{
            share = amount*contractTotalShares/contractTotalStaked;
        }

        userStakedStartTime[msg.sender] = block.timestamp;//只记录最后一次质押的时间

        userShares[msg.sender] += share;//玩家份额增加
        contractTotalShares += share;//系统总份额增加

        userStaked[msg.sender] += amount;//玩家质押金额增加
        contractTotalStaked += amount;//系统总质押金额增加

        stakingToken.transferFrom(msg.sender, address(this), amount);//把质押的token转到当前合约

        emit Staked(msg.sender,amount);
    }

    //计算用户的可领取奖励
    function calculateReward(address user) public returns (uint256) {
        if (contractTotalShares == 0) {
            return 0;
        }

        //质押时长
        uint256 duration = block.timestamp - userStakedStartTime[user];
        if(duration == 0)
        {
            return 0;
        }
        // 根据用户的份额占比，计算其可领取的奖励
        uint256 userSharePercentage = (userShares[user] * 1e18) / contractTotalShares;
        uint256 rewardAmount = (rewardToken.balanceOf(address(this)) * userSharePercentage) / 1e18; //份额奖励
        uint256 durationRewardAmount = duration * stakeRewardPerSecond; //时长奖励
        uint256 totalReward = rewardAmount + durationRewardAmount;
        return totalReward;
    }

    //用户领取质押奖励
    function claimReward() public {
        require(userStaked[msg.sender] >= 0, "Insufficient staked amount");
        //发奖
        uint256 reward = calculateReward(msg.sender);
        userStakedStartTime[msg.sender] = block.timestamp;
        rewardToken.transfer(msg.sender, reward);
        emit ClaimReward(msg.sender,reward);
    }



    //用户提取质押金额和奖励
    function withdraw(uint256 amount) external {
        require(amount > 0 ,"amount must be greater than 0");
        require(userStaked[msg.sender] >= amount, "Insufficient staked amount");

        //发放奖励
        claimReward();

        //归还质押
        uint256 share = amount*contractTotalShares/contractTotalStaked;
        userStakedStartTime[msg.sender] = block.timestamp;//更新质押的时间
        userShares[msg.sender] -= share;//玩家减少
        contractTotalShares -= share;//系统总份额减少

        userStaked[msg.sender] -= amount;//玩家质押金额减少
        contractTotalStaked -= amount;//系统总质押金额减少

        stakingToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }
}
