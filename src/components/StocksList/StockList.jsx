import * as CONSTANTS from "../../constants"

import { useFilteredSignals } from "../../hooks/useFilteredSignals";
import Pagination from "../Pagination";

import { useEffect, useState } from "react";

import SignalsTable from "../SignalsTable";
import {useSectors} from "../../hooks/useSectors";
import {useSignals} from "../../hooks/useSignals";

import SectorSection from "../SectorSection";


const ITEMS_PER_PAGE = CONSTANTS.ITEMS_PER_PAGE;

const StockList = () => {


  const handleSort = (key) => {
  setSortConfig((prev) => ({
    key,
    direction:
      prev.key === key && prev.direction === "asc"
        ? "desc"
        : "asc",
  }));
};

  const signals = useSignals();
  const sectors = useSectors();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "dayChange",
    direction: "desc",
  });
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedSectorGroup, setSelectedSectorGroup] =
    useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useFilteredSignals(
    signals.data,
    searchTerm,
    selectedSector,
    selectedSectorGroup,
    sortConfig
  );

  const totalPages = Math.ceil(
    filtered.length / ITEMS_PER_PAGE
  );

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSector, selectedSectorGroup, sortConfig]);

  if (signals.loading) return <div>Loading...</div>;
  if (signals.error) return <div>{signals.error}</div>;

  return (
    <div className="bg-white rounded shadow p-4">
      <SectorSection
        sectors={sectors.data}
        selectedSector={selectedSector}
        selectedSectorGroup={selectedSectorGroup}
        onSelectSector={setSelectedSector}
        onClear={() => {
          setSelectedSector(null);
          setSelectedSectorGroup(null);
        }}
      />

     <SignalsTable
  data={paginated}
  sortConfig={sortConfig}
  onSort={handleSort}
  selectedSector={selectedSector}
/>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={setCurrentPage}
      />
    </div>
  );
};

export default StockList;