import Header from "@/components/header/Header";
import SectorSection from "../../components/SectorSection";
import SignalsTable from "../../components/SignalsTable";
import { useState } from "react";



const Hero = () => {

    const [selectedSector, setSelectedSector] = useState(null);


  return (
    <div className="min-h-screen bg-slate-50">

      {/* Dashboard Content */}
      <div className="flex gap-6 p-6">
      

        {/* Main Area */}
        <div className="flex-1">

        <SectorSection onSectorSelect={setSelectedSector} ></SectorSection>
        <SignalsTable sector={selectedSector} ></SignalsTable>


        </div>
      </div>
    </div>
  );
};

export default Hero;
