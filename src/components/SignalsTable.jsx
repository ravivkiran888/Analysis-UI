import { formatTimestamp, formatVolume } from "../utils/formatters";
import { useSignals } from "../hooks/useSignals";
import { sortData, toggleSort } from "../utils/sorting";
import { useState, useMemo, useEffect } from "react";
import ReusableTable from "./ReusableTable";

// ✅ Group mapping
const SECTOR_GROUPS = {
  BANKNIFTY: ["BANKNIFTY", "NIFTYPVTBANK", "NIFTYPSUBANK"]
};

// ✅ Normalize helper
const normalize = (val) =>
  val?.replace(/\s+/g, "").trim().toUpperCase();

const SignalsTable = ({ sector }) => {

  const { data = [], loading, error } = useSignals();

  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const filteredData = useMemo(() => {

    if (!sector) return data;

    const normalizedSector = normalize(sector);

    return data.filter(item => {
      const itemSector = normalize(item.sector);

      if (SECTOR_GROUPS[normalizedSector]) {
        return SECTOR_GROUPS[normalizedSector]
          .map(normalize)
          .includes(itemSector);
      }

      return itemSector === normalizedSector;
    });

  }, [data, sector]);

  // ✅ Sorting
  const sortedData = useMemo(() => {
    return sortData(filteredData, sortColumn, sortDirection);
  }, [filteredData, sortColumn, sortDirection]);

  // ✅ Pagination
  const paginatedData = useMemo(() => {
    return sortedData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // ✅ Reset page on sector change
  useEffect(() => {
    setCurrentPage(1);
  }, [sector]);

  // ✅ Sorting handler
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(toggleSort(sortDirection));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }

    setCurrentPage(1);
  };

  const lastUpdated = filteredData.length ? filteredData[0].timestamp : null;

  if (loading) {
    return <div className="mb-6 text-sm text-gray-500">Loading signals...</div>;
  }

  if (error) {
    return <div className="mb-6 text-sm text-red-500">Failed to load signals</div>;
  }

  // ✅ Columns
  const columns = [
    {
      header: "Symbol",
      accessor: "symbol",
      className: "text-left py-2 px-2",
      render: (row) => (
        <span className="font-semibold text-blue-600">
          {row.symbol}
        </span>
      )
    },
    {
      header: "Open",
      accessor: "dayOpen",
      className: "hidden sm:table-cell text-right py-2 px-2",
      render: (row) => row.dayOpen?.toFixed(2)
    },
    {
      header: "LTP",
      accessor: "lastTradedPrice",
      className: "text-right cursor-pointer",
      render: (row) => row.lastTradedPrice?.toFixed(2),
      onClick: () => handleSort("lastTradedPrice")
    },
    {
      header: "Change",
      accessor: "dayChange",
      className: "text-right cursor-pointer",
      onClick: () => handleSort("dayChange"),
      render: (row) => {
        const color =
          row.dayChange >= 0 ? "text-green-600" : "text-red-600";

        return (
          <span className={color}>
            {row.dayChange >= 0 ? "+" : ""}
            {row.dayChange?.toFixed(2)}
          </span>
        );
      }
    },
    {
      header: "Day Range",
      accessor: "range",
      className: "text-right",
      render: (row) => (
        <>
          <span className="text-green-600">
            {row.dayHigh?.toFixed(2)}
          </span>
          /
          <span className="text-red-600">
            {row.dayLow?.toFixed(2)}
          </span>
        </>
      )
    },
    {
      header: "Volume",
      accessor: "totalDayVolume",
      className: "text-right cursor-pointer",
      onClick: () => handleSort("totalDayVolume"),
      render: (row) => formatVolume(row.totalDayVolume)
    },
    {
      header: "Signal",
      accessor: "signal",
      className: "text-center",
      render: (row) => {
        const style =
          row.signal === "ENTRY_READY"
            ? "bg-green-600 text-white"
            : "bg-yellow-100 text-yellow-800";

        return (
          <span className={`px-2 py-1 rounded ${style}`}>
            {row.signal}
          </span>
        );
      }
    },
    {
      header: "Sector",
      accessor: "sector",
      className: "text-left",
      render: (row) =>
        row.sector === "Unknown" ? "" : row.sector
    }
  ];

  // ✅ Row highlight
  const tableData = paginatedData.map(item => {
    const highlight = item.dayOpen - item.dayLow < 0.5;

    return {
      ...item,
      rowClass: highlight ? "bg-green-50" : ""
    };
  });

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">

      {sector}

      {/* Last Updated */}
      <div className="px-3 py-2 text-sm text-gray-600 border-b bg-gray-50">
        Last Updated:
        <span className="font-semibold ml-1">
          {lastUpdated ? formatTimestamp(lastUpdated) : "—"}
        </span>
      </div>

      {/* ✅ Entry Criteria Note */}
      <div className="px-3 py-2 text-xs text-gray-600 border-b bg-blue-50">
        <span className="font-semibold">Note:</span> Entry Criteria:
        <br />
        • Trend: VWAP + EMA20 <br />
        • Momentum: RSI + Price Rising <br />
        • Participation: Volume Expansion <br />
        • Trigger: Breakout
      </div>

      {/* Table */}
      <ReusableTable columns={columns} data={tableData} />

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 p-3">

        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

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