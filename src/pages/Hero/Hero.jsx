import Header from "@/components/header/Header";
import StockList from "@/components/StocksList/StockList";
import WatchStocks from "@/components/StocksList/WatchStocks";



const Hero = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      {/* Dashboard Content */}
      <div className="flex gap-6 p-6">
        {/* Left Widgets */}
        

        {/* Main Area */}
        <div className="flex-1">


        <StockList></StockList> 
        <WatchStocks></WatchStocks>

        </div>
      </div>
    </div>
  );
};

export default Hero;
