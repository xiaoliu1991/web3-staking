import { useContext, useState } from "react";
import { WalletHandler } from "../wallet/WalletHandler";

const companyCommonStyles = "min-h-[50px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";

const Input = ({ placeholder,value,onValueChange}) => (
    <input
      placeholder={placeholder}
      value={value}
      className="w-full h-full text-black text-center"
      min={1}
      max={999999}
      type="number"
      onChange={(e)=>{onValueChange(e.target.value)}}
    />
);

const Staking = ()=>{
    const {stakingTotal,userStakingTotal,userSTATokenBalancen,
           userStakingReward,stakeRewardPerSecond,userShare,
           refreshUserData,refreshStakingReward,claimStakingReward,
           executeStaking,withdrawStaking} = useContext(WalletHandler);
    const [stakingValue,setStakingValue] = useState(0);

    return (
        <div className="flex w-full max-h-full justify-center items-center gradient-bg-staking">
            <div className="flex mf:flex-row flex-col items-center justify-between">
                <div className="grid sm:grid-cols-3 grid-cols-2 w-full mt-10">
                    <div className={`rounded-tl-2xl ${companyCommonStyles}`}>名称</div>
                    <div className={companyCommonStyles}>数据</div>
                    <div className={companyCommonStyles}>操作</div>
                    
                    <div className={companyCommonStyles}>账户余额</div>
                    <div className={companyCommonStyles}>{userSTATokenBalancen} STA</div>
                    <div className={companyCommonStyles}>
                        <button onClick={refreshUserData} className="bg-[#2952e3] hover:bg-[#6278C6] px-5 py-2 rounded-full cursor-pointer">
                        刷新
                        </button>  
                    </div>

                    <div className={companyCommonStyles}>当前质押总量</div>
                    <div className={companyCommonStyles}>{stakingTotal} STA</div>
                    <div className={companyCommonStyles}></div>

                    <div className={companyCommonStyles}>质押量</div>
                    <div className={companyCommonStyles}>{userStakingTotal} STA</div>
                    <div className={companyCommonStyles}>
                        {(userStakingTotal > 0 &&
                            <button onClick={withdrawStaking} className="bg-[#2952e3] hover:bg-[#6278C6] px-5 py-2 rounded-full cursor-pointer">
                            取出本金和奖励
                            </button>
                        )}
                    </div>

                    <div className={companyCommonStyles}>所占份额</div>
                    <div className={companyCommonStyles}>{userShare}</div>
                    <div className={companyCommonStyles}></div>

                    <div className={companyCommonStyles}>每秒奖励</div>
                    <div className={companyCommonStyles}>{stakeRewardPerSecond}/s STA</div>
                    <div className={companyCommonStyles}></div>

                    <div className={companyCommonStyles}>收益</div>
                    <div className={companyCommonStyles}>{userStakingReward} STA</div>
                    <div className={`${companyCommonStyles}`}>
                        <button onClick={refreshStakingReward} className="bg-[#2952e3] hover:bg-[#6278C6] px-5 py-2 mx-2 rounded-full cursor-pointer">
                        刷新收益
                        </button>
                        {(userStakingTotal > 0 &&
                            <button onClick={claimStakingReward} className="bg-[#2952e3] hover:bg-[#6278C6] px-5 py-2 rounded-full cursor-pointer">
                            领取
                            </button>
                        )}
                    </div>
                    <div className={companyCommonStyles}>质押</div>
                    <div className="sm:w-60 white-glassmorphism">
                        <Input placeholder="0 STA" value={stakingValue} onValueChange={setStakingValue}/>
                    </div>
                    <div className={`rounded-br-2xl ${companyCommonStyles}`}>
                        <button onClick={()=>{
                            executeStaking(stakingValue)
                        }} className="bg-[#008E0F] hover:bg-[#86C38C] px-5 py-2 rounded-full cursor-pointer">
                            质押
                        </button>
                    </div>
                </div>
            </div>      
        </div>
    );
}

export default Staking;