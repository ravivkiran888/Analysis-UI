import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"
import Hero from "./pages/Hero/Hero";

import OptionsSignalDashboard from "./components/OptionsTable";
import AvgPriceTable from "./components/AvgPriceTable";
import SupportBreakoutTable from "./components/SupportBreakoutTable";

function App() {
  return (

    
    
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Hero />} />
           <Route path="analysis" element={<OptionsSignalDashboard />} />
             <Route path="avgPrice" element={<AvgPriceTable />} />
               <Route path="nsr" element={<SupportBreakoutTable />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;