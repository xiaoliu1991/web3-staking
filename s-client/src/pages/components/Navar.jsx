import { useContext, useEffect } from "react";
import { ConnectWallet } from "../wallet/ConnectWallet";

const Navbar = ()=>{
    const {connectWallet,disconnectWallet,connectedAccount} = useContext(ConnectWallet);

    return (
        <nav className='w-full flex justify-between p-10'>
            <div className="text-white px-10 py-4">
                Staking Reward
            </div>
            <div className="text-white">
                {(connectedAccount && 
                <h1>
                    {connectedAccount} 
                    &nbsp;&nbsp;
                    {(connectedAccount && 
                    <button className="bg-[#2952e3] hover:bg-[#2546bd] px-5 py-1 rounded-full cursor-pointer" onClick={disconnectWallet}>断开链接</button>
                    )}
                </h1>
                )}
               

                {(!connectedAccount && 
                <button onClick={connectWallet} className="bg-[#2952e3] hover:bg-[#2546bd] px-20 py-3 rounded-full cursor-pointer">
                    Connect Wallet
                </button>)}
            </div>
        </nav>
    );
}

export default Navbar;