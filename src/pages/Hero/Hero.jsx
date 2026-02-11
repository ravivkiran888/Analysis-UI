import Header from "@/components/header/Header";
import StockList from "@/components/StocksList/StockList";



const Hero = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      {/* Dashboard Content */}
      <div className="flex gap-6 p-6">
      

        {/* Main Area */}
        <div className="flex-1">


        <StockList></StockList> 

        </div>
      </div>
    </div>
  );
};

export default Hero;
