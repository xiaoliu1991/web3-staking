import { Navar,Staking,Services,Footer } from "./components";
import { WalletHandlerProvider } from "./wallet/WalletHandler";


const App = ()=>{
  return (
  <WalletHandlerProvider>
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        <Navar />
      </div>
      <Staking />
      <Services />
      <Footer />
    </div>
  </WalletHandlerProvider>
  );
}

export default App;
