import { useEffect, useMemo, useState } from "react";
import * as CONSTANTS from "../../constants/";

const StockList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "dayChange", direction: "desc" });
  const [modalData, setModalData] = useState(null); // { content }

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/signals/ready`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((json) => {
        setData(Array.isArray(json) ? json : [json]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    let filtered = data;
    if (term) {
      filtered = data.filter((item) =>
        [item.symbol].filter(Boolean).some((field) => field.toLowerCase().includes(term))
      );
    }
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null || bVal == null) return 0;
        return sortConfig.direction === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredData.length / CONSTANTS.ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * CONSTANTS.ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + CONSTANTS.ITEMS_PER_PAGE);

  const formatVolume = (volume) => {
    if (!volume || volume === 0) return "Not Available";
    if (volume >= 10000000) return (volume / 10000000).toFixed(2) + "Cr";
    if (volume >= 100000) return (volume / 100000).toFixed(2) + "L";
    if (volume >= 1000) return (volume / 1000).toFixed(2) + "K";
    return volume.toString();
  };

  const formatTimestampMobile = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimestampFull = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + " " + date.toLocaleDateString();
  };

  const shouldHighlightRow = (item) => {
    if (!item.dayOpen || !item.dayLow) return false;
    return Math.abs(item.dayOpen - item.dayLow) < 0.8;
  };

  const getSignalStyle = (signal) => {
    if (signal === "ENTRY_READY") {
      return "bg-green-700 text-white font-semibold";
    }
    if (signal === "WATCH") {
      return "bg-green-200 text-gray-800 font-semibold";
    }
    return "bg-gray-200 text-gray-600";
  };

  // Format description with bold and line breaks
  const formatDescription = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });
      return (
        <div key={i}>
          {formattedLine}
          {i < lines.length - 1 && <br />}
        </div>
      );
    });
  };

  const openDescriptionModal = (content) => setModalData({ content });
  const closeModal = () => setModalData(null);

  if (loading) return <div className="p-4 text-sm">Loading entry-ready signals...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">🚀 ENTRY READY & WATCH SIGNALS</h3>
          <p className="text-xs text-gray-500">
            {filteredData.length} opportunities • Page {currentPage}/{totalPages}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Scrollable table */}
      <div className="relative">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Symbol</th>
                <th className="hidden sm:table-cell text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Open</th>
                <th className="text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">LTP</th>
                <th
                  className="text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium cursor-pointer hover:bg-gray-200 whitespace-nowrap"
                  onClick={() => handleSort("dayChange")}
                >
                  Change {sortConfig.key === "dayChange" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className="text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Day Range</th>
                <th className="text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Tot Volume</th>
                <th className="text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Updated</th>
                <th className="text-center py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Signal</th>
                <th className="text-center py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Details</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => {
                const highlight = shouldHighlightRow(item);
                const openLowDiff = item.dayOpen && item.dayLow
                  ? Math.abs(item.dayOpen - item.dayLow).toFixed(2)
                  : null;

                return (
                  <tr
                    key={item.symbol}
                    className={`border-b hover:bg-gray-100 transition-colors ${
                      highlight ? "bg-green-100" : ""
                    }`}
                    title={highlight ? `Open-Low difference: ${openLowDiff}` : ""}
                  >
                    <td className="py-1 px-0.5 sm:py-2 sm:px-2 font-medium text-blue-600 whitespace-nowrap">
                      {item.symbol}
                    </td>
                    <td className="hidden sm:table-cell text-right whitespace-nowrap">
                      {item.dayOpen?.toFixed(2)}
                    </td>
                    <td className="py-1 px-0.5 sm:py-2 sm:px-2 text-right font-bold whitespace-nowrap">
                      {item.lastTradedPrice?.toFixed(2)}
                    </td>
                    <td className={`py-1 px-0.5 sm:py-2 sm:px-2 text-right whitespace-nowrap ${
                      item.dayChange >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {item.dayChange >= 0 ? "+" : ""}
                      {item.dayChange?.toFixed(2)}
                    </td>
                    <td className="py-1 px-0.5 sm:py-2 sm:px-2 text-right whitespace-nowrap">
                      <span className="text-green-600">{item.dayHigh?.toFixed(2)}</span>
                      /<span className="text-red-600">{item.dayLow?.toFixed(2)}</span>
                    </td>
                    <td className="py-1 px-0.5 sm:py-2 sm:px-2 text-right font-mono whitespace-nowrap">
                      {formatVolume(item.totalDayVolume)}
                    </td>
                    <td className="py-1 px-0.5 sm:py-2 sm:px-2 text-right text-xs text-gray-500 whitespace-nowrap">
                      <span className="sm:hidden" title={formatTimestampFull(item.timestamp)}>
                        {formatTimestampMobile(item.timestamp)}
                      </span>
                      <span className="hidden sm:inline">
                        {formatTimestampFull(item.timestamp)}
                      </span>
                    </td>
                    {/* Signal column */}
                    <td className="py-1 px-0.5 sm:py-2 sm:px-2 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${getSignalStyle(item.signal)}`}>
                        {item.signal || "UNKNOWN"}
                      </span>
                    </td>
                    {/* Details column with icon */}
                    <td className="py-1 px-0.5 sm:py-2 sm:px-2 text-center whitespace-nowrap">
                      {item.description ? (
                        <button
                          onClick={() => openDescriptionModal(item.description)}
                          className="cursor-pointer text-blue-500 text-lg focus:outline-none"
                          aria-label="View full details"
                        >
                          ℹ️
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-white to-transparent" />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3 pt-3 border-t">
          <div className="text-xs text-gray-500">
            Showing {paginatedData.length} of {filteredData.length}
          </div>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
            >
              ←
            </button>
            <span className="px-2 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No signals found
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      )}

      {/* Modal for Description */}
      {modalData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-800">Options Levels & Details</h4>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {formatDescription(modalData.content)}
            </div>
            <button
              onClick={closeModal}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockList;