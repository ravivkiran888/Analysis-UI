import { useEffect, useMemo, useState } from "react";
import * as CONSTANTS from "../../constants/";

const StockList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalContent, setModalContent] = useState(null); // holds level insights for modal
  const [sortConfig, setSortConfig] = useState({ key: "dayChange", direction: "desc" }); // default sort by dayChange desc

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/signals/ready`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) {
          setData(json);
        } else {
          setData([json]);
        }
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
    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null || bVal == null) return 0;
        if (sortConfig.direction === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
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
    if (volume >= 10000000) {
      return (volume / 10000000).toFixed(2) + "Cr";
    } else if (volume >= 100000) {
      return (volume / 100000).toFixed(2) + "L";
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(2) + "K";
    }
    return volume.toString();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + " " + date.toLocaleDateString();
  };

  // Helper to format level insights with bold and line breaks
  const formatLevelInsights = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const content = part.slice(2, -2);
          return <strong key={j}>{content}</strong>;
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

  // Function to check if row should be highlighted
  const shouldHighlightRow = (item) => {
    if (!item.dayOpen || !item.dayLow) return false;
    const difference = Math.abs(item.dayOpen - item.dayLow);
    return difference < 0.8;
  };

  const openModal = (insights) => {
    setModalContent(insights);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  if (loading) return <div className="p-4 text-sm">Loading entry-ready signals...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-7xl mx-auto">
      {/* Header with title, count, and search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">🚀 ENTRY READY SIGNALS</h3>
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

      {/* Optional summary stats – can be filled later */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-xs"></div>

      {/* Scrollable table container with subtle right-edge shadow hint */}
      <div className="relative">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-1 px-1 sm:py-2 sm:px-2 font-medium">Symbol</th>
                <th className="hidden sm:table-cell text-right py-1 px-1 sm:py-2 sm:px-2 font-medium">Open</th>
                <th className="text-right py-1 px-1 sm:py-2 sm:px-2 font-medium">LTP</th>
                <th
                  className="hidden sm:table-cell text-right py-1 px-1 sm:py-2 sm:px-2 font-medium cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort("dayChange")}
                >
                  Change{" "}
                  {sortConfig.key === "dayChange" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className="text-right py-1 px-1 sm:py-2 sm:px-2 font-medium">Day Range</th>
                <th className="text-right py-1 px-1 sm:py-2 sm:px-2 font-medium">Tot Volume</th>
                <th className="text-right py-1 px-1 sm:py-2 sm:px-2 font-medium">Updated</th>
                <th className="text-center py-1 px-1 sm:py-2 sm:px-2 font-medium">Volume</th>
                <th className="text-center py-1 px-1 sm:py-2 sm:px-2 font-medium">Levels</th>
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
                    <td className="py-1 px-1 sm:py-2 sm:px-2 font-medium text-blue-600">
                      {item.symbol}
                    </td>
                    <td className="hidden sm:table-cell text-right">{item.dayOpen?.toFixed(2)}</td>
                    <td className="py-1 px-1 sm:py-2 sm:px-2 text-right font-bold">
                      {item.lastTradedPrice?.toFixed(2)}
                    </td>
                    <td className={`hidden sm:table-cell text-right ${
                      item.dayChange >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {item.dayChange >= 0 ? "+" : ""}
                      {item.dayChange?.toFixed(2)}
                    </td>
                    <td className="py-1 px-1 sm:py-2 sm:px-2 text-right">
                      <span className="text-green-600">{item.dayHigh?.toFixed(2)}</span>
                      {" / "}
                      <span className="text-red-600">{item.dayLow?.toFixed(2)}</span>
                    </td>
                    <td className="hidden sm:table-cell text-right font-mono">
                      {formatVolume(item.totalDayVolume)}
                    </td>
                    <td className="py-1 px-1 sm:py-2 sm:px-2 text-right text-xs text-gray-500">
                      {formatTimestamp(item.timestamp)}
                    </td>
                    {/* Volume Commentary Column (hover tooltip) */}
                    <td className="py-1 px-1 sm:py-2 sm:px-2 text-center">
                      {item.volumeCommentary ? (
                        <div className="relative group">
                          <span className="cursor-help text-blue-500 text-lg">📊</span>
                          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64 z-10 whitespace-pre-wrap text-left">
                            {item.volumeCommentary}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {/* Levels Column (click for modal) */}
                    <td className="py-1 px-1 sm:py-2 sm:px-2 text-center">
                      {item.levelInsights ? (
                        <button
                          onClick={() => openModal(item.levelInsights)}
                          className="cursor-pointer text-blue-500 text-lg focus:outline-none"
                          aria-label="View levels"
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
        {/* Subtle gradient shadow to hint scrollable content */}
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

      {/* Modal for level insights */}
      {modalContent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-800">Key Levels</h4>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {formatLevelInsights(modalContent)}
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

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No entry-ready signals found
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default StockList;