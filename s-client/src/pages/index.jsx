import { Navar,Staking,Services,Footer } from "./components";
import { ConnectWalletProvider } from "./wallet/ConnectWallet";


const App = ()=>{
  return (
  <ConnectWalletProvider>
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        <Navar />
      </div>
      <Staking />
      <Services />
      <Footer />
    </div>
  </ConnectWalletProvider>
  );
}

export default App;
