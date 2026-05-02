import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"
import Hero from "./pages/Hero/Hero";

import OptionsSignalDashboard from "./components/OptionsTable";

function App() {
  return (

    
    
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Hero />} />
           <Route path="analysis" element={<OptionsSignalDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;