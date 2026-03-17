import { formatTimestamp, formatVolume } from "../utils/formatters";
import { useSignals } from "../hooks/useSignals";
import { sortData, toggleSort } from "../utils/sorting";
import { useState, useMemo, useEffect } from "react";

const BANK_SECTOR_MAPPING = [
  "BANKNIFTY",
  "NIFTYPVTBANK",
  "NIFTYPSUBBANK"
];

const SignalsTable = ({ sector }) => {

  const { data = [], loading, error } = useSignals();

  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("");

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // ✅ Filtering
  const filteredData = sector
    ? data.filter(item =>
        sector === "BANKNIFTY"
          ? BANK_SECTOR_MAPPING.includes(item.sector)
          : item.sector === sector
      )
    : data;

  // ✅ Sorting
  const sortedData = useMemo(() => {
    return sortData(filteredData, sortColumn, sortDirection);
  }, [filteredData, sortColumn, sortDirection]);

  // ✅ Pagination slice
  const paginatedData = useMemo(() => {
    return sortedData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // ✅ Reset page on sector change
  useEffect(() => {
    setCurrentPage(1);
  }, [sector]);

  // ✅ Google-style page numbers logic
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const renderArrow = (column) => {
    if (sortColumn !== column) return "";
    return sortDirection === "asc" ? "▲" : "▼";
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(toggleSort(sortDirection));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const lastUpdated = filteredData.length ? filteredData[0].timestamp : null;

  if (loading) {
    return <div className="mb-6 text-sm text-gray-500">Loading signals...</div>;
  }

  if (error) {
    return <div className="mb-6 text-sm text-red-500">Failed to load signals</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">

      {sector}

      <div className="px-3 py-2 text-sm text-gray-600 border-b bg-gray-50">
        Last Updated:
        <span className="font-semibold ml-1">
          {lastUpdated ? formatTimestamp(lastUpdated) : "—"}
        </span>
      </div>

      <table className="w-full text-sm">

        <thead className="text-xs uppercase text-gray-500 bg-gray-50">
          <tr>
            <th className="text-left py-2 px-2">Symbol</th>
            <th className="hidden sm:table-cell text-right py-2 px-2">Open</th>

            <th onClick={() => handleSort("lastTradedPrice")} className="text-right cursor-pointer">
              LTP {renderArrow("lastTradedPrice")}
            </th>

            <th onClick={() => handleSort("dayChange")} className="text-right cursor-pointer">
              Change {renderArrow("dayChange")}
            </th>

            <th className="text-right">Day Range</th>

            <th onClick={() => handleSort("totalDayVolume")} className="text-right cursor-pointer">
              Volume {renderArrow("totalDayVolume")}
            </th>

            <th className="text-center">Signal</th>
            <th className="text-left">Sector</th>
          </tr>
        </thead>

        <tbody>

          {paginatedData.map((item) => {

            const openLowDiff = item.dayOpen - item.dayLow;
            const highlight = openLowDiff < 0.5;

            const changeColor =
              item.dayChange >= 0 ? "text-green-600" : "text-red-600";

            const signalStyle =
              item.signal === "ENTRY_READY"
                ? "bg-green-600 text-white"
                : "bg-yellow-100 text-yellow-800";

            return (
              <tr key={item.symbol} className={highlight ? "bg-green-50" : ""}>

                <td className="py-2 px-2 font-semibold text-blue-600">
                  {item.symbol}
                </td>

                <td className="hidden sm:table-cell text-right">
                  {item.dayOpen?.toFixed(2)}
                </td>

                <td className="text-right font-semibold">
                  {item.lastTradedPrice?.toFixed(2)}
                </td>

                <td className={`text-right font-semibold ${changeColor}`}>
                  {item.dayChange >= 0 ? "+" : ""}
                  {item.dayChange?.toFixed(2)}
                </td>

                <td className="text-right">
                  <span className="text-green-600">{item.dayHigh?.toFixed(2)}</span>
                  /
                  <span className="text-red-600">{item.dayLow?.toFixed(2)}</span>
                </td>

                <td className="text-right font-mono">
                  {formatVolume(item.totalDayVolume)}
                </td>

                <td className="text-center">
                  <span className={`px-2 py-1 rounded ${signalStyle}`}>
                    {item.signal}
                  </span>
                </td>

                <td>
                  {item.sector === "Unknown" ? "" : item.sector}
                </td>

              </tr>
            );
          })}

        </tbody>
      </table>

      {/* ✅ Google Style Pagination */}
      <div className="flex justify-center items-center gap-2 p-3">

        {/* Prev */}
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        {/* First + ... */}
        {currentPage > 3 && (
          <>
            <button onClick={() => setCurrentPage(1)} className="px-2">1</button>
            <span>...</span>
          </>
        )}

        {/* Page Numbers */}
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page ? "bg-blue-600 text-white" : ""
            }`}
          >
            {page}
          </button>
        ))}

        {/* ... + Last */}
        {currentPage < totalPages - 2 && (
          <>
            <span>...</span>
            <button onClick={() => setCurrentPage(totalPages)} className="px-2">
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default SignalsTable;