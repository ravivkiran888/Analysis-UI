import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"
import Hero from "./pages/Hero/Hero";
import Analysis from "./components/Analysis";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Hero />} />
          <Route path="/analysis" element={<Analysis />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;