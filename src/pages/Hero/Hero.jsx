import Header from "@/components/header/Header";
import SectorSection from "../../components/SectorSection";
import SignalsTable from "../../components/SignalsTable";



const Hero = () => {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Dashboard Content */}
      <div className="flex gap-6 p-6">
      

        {/* Main Area */}
        <div className="flex-1">

        <SectorSection></SectorSection>
        <SignalsTable></SignalsTable>


        </div>
      </div>
    </div>
  );
};

export default Hero;
