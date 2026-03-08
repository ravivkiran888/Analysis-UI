import { useFilteredSignals } from "../hooks/useFilteredSignals";
import Pagination from "./Pagination";

import { useEffect, useState } from "react";

import SignalsTable from "./SignalsTable";
import { useFetchAll } from "../hooks/useFetchAll";

const ITEMS_PER_PAGE = 20;

const Analysis = () => {

  const signals = useFetchAll();

  const [searchTerm, setSearchTerm] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "dayChange",
    direction: "desc",
  });

  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedSectorGroup, setSelectedSectorGroup] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const filtered = useFilteredSignals(
    signals.data,
    searchTerm,
    selectedSector,
    selectedSectorGroup,
    sortConfig
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

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

      <h3 className="text-lg font-semibold mb-3">Analysis</h3>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search symbol (INFY, REL, TCS...)"
          className="border px-3 py-1 rounded w-full sm:w-64"
        />
      </div>

      {/* Table */}
      <SignalsTable
        data={paginated}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectedSector={selectedSector}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={setCurrentPage}
      />

    </div>
  );
};

export default Analysis;