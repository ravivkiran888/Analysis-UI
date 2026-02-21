import { useEffect, useMemo, useState } from "react";
import * as CONSTANTS from "../../constants/";

const StockList = () => {
  const [data, setData] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectorLoading, setSectorLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectorError, setSectorError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "dayChange", direction: "desc" });
  const [selectedSector, setSelectedSector] = useState(null); // New state for sector filter

  // Fetch signals data
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

  // Fetch sector data
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/signals/sectors`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sector data");
        return res.json();
      })
      .then((json) => {
        setSectorData(Array.isArray(json) ? json : [json]);
        setSectorLoading(false);
      })
      .catch((err) => {
        setSectorError(err.message);
        setSectorLoading(false);
      });
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle sector card click
  const handleSectorClick = (sector) => {
    setSelectedSector(prevSector => prevSector === sector ? null : sector);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear sector filter
  const clearSectorFilter = () => {
    setSelectedSector(null);
  };

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    let filtered = data;
    
    // Apply search filter
    if (term) {
      filtered = filtered.filter((item) =>
        [item.symbol].filter(Boolean).some((field) => field.toLowerCase().includes(term))
      );
    }
    
    // Apply sector filter
    if (selectedSector) {
      filtered = filtered.filter((item) => item.sector === selectedSector);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null || bVal == null) return 0;
        return sortConfig.direction === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig, selectedSector]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, selectedSector]);

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

  // Helper function to display sector (empty if Unknown)
  const displaySector = (sector) => {
    if (!sector || sector === "Unknown") return "";
    return sector;
  };

  // Helper function to get sector display name
  const getSectorDisplayName = (sector) => {
    const sectorMap = {
      "BANKNIFTY": "Bank",
      "NIFTYFMCG": "FMCG",
      "NIFTYPSUBANK": "PSU Bank",
      "NIFTYPVTBANK": "Pvt Bank",
      "NIFTYMETAL": "Metal",
      "FINNIFTY": "Fin Serv",
      "NIFTYAUTO": "Auto",
      "NIFTYPHARMA": "Pharma",
      "NIFTYREALTY": "Realty",
      "NIFTYMEDIA": "Media",
      "NIFTYIT": "IT"
    };
    return sectorMap[sector] || sector;
  };

  // Get green color intensity based on positive change value
  const getGreenIntensity = (change) => {
    if (change <= 0) return "text-red-600"; // Return red for negative
    
    // Define thresholds for different green shades
    if (change >= 300) return "text-green-900 font-bold"; // Darkest green for very high positive
    if (change >= 200) return "text-green-800 font-bold";
    if (change >= 150) return "text-green-700 font-semibold";
    if (change >= 100) return "text-green-600 font-semibold";
    if (change >= 50) return "text-green-500";
    return "text-green-400"; // Lightest green for small positive
  };

  // Get background color intensity for card
  const getGreenBackground = (change, isSelected) => {
    if (isSelected) return "bg-blue-100 border-blue-300 ring-2 ring-blue-300";
    if (change <= 0) return "bg-white";
    
    if (change >= 300) return "bg-green-100 border-green-300";
    if (change >= 200) return "bg-green-50 border-green-200";
    if (change >= 150) return "bg-green-50 border-green-200";
    if (change >= 100) return "bg-green-50 border-green-100";
    if (change >= 50) return "bg-white border-green-100";
    return "bg-white";
  };

  if (loading && sectorLoading) return <div className="p-4 text-sm">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-7xl mx-auto">
      {/* Sector Cards Section */}
      {sectorError ? (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">
          Error loading sectors: {sectorError}
        </div>
      ) : sectorLoading ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-24 h-16 bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      ) : sectorData.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-600">📊 SECTOR PERFORMANCE</h4>
            {selectedSector && (
              <button
                onClick={clearSectorFilter}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                Clear Filter ✕
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
            {sectorData.map((sector) => {
              // Skip entries without a valid sector name
              if (!sector.sector) return null;
              
              const isPositive = sector.dayChange >= 0;
              const textColorClass = isPositive 
                ? getGreenIntensity(sector.dayChange)
                : 'text-red-600';
              
              const isSelected = selectedSector === sector.sector;
              
              // Add background shading for positive sectors and highlight for selected
              const bgClass = getGreenBackground(sector.dayChange, isSelected);

              return (
                <div
                  key={sector.sector}
                  onClick={() => handleSectorClick(sector.sector)}
                  className={`flex-shrink-0 border rounded-lg shadow-sm p-3 min-w-[120px] hover:shadow-md transition-all cursor-pointer ${bgClass} ${
                    isSelected ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getSectorDisplayName(sector.sector)}
                  </div>
                  <div className={`text-sm font-bold mt-1 ${textColorClass}`}>
                    {isPositive ? '+' : ''}{sector.dayChange?.toFixed(2)}
                  </div>
                  {isSelected && (
                    <div className="text-[10px] text-blue-600 font-medium mt-1">
                      ✓ Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">🚀 ENTRY READY & WATCH SIGNALS</h3>
          <p className="text-xs text-gray-500">
            {filteredData.length} opportunities • Page {currentPage}/{totalPages}
            {selectedSector && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                Filtering: {getSectorDisplayName(selectedSector)}
              </span>
            )}
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

      {/* Error message for signals data */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">
          Error loading signals: {error}
        </div>
      )}

      {/* Scrollable table */}
      {!loading && !error && (
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
                  <th className="text-left py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Sector</th>
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
                      {/* Sector column - empty for Unknown */}
                      <td className="py-1 px-0.5 sm:py-2 sm:px-2 whitespace-nowrap text-gray-600">
                        {displaySector(item.sector)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-white to-transparent" />
        </div>
      )}

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
      {!loading && filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No signals found
          {searchTerm && ` for "${searchTerm}"`}
          {selectedSector && ` in ${getSectorDisplayName(selectedSector)} sector`}
          {(searchTerm || selectedSector) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedSector(null);
              }}
              className="ml-2 text-blue-500 hover:text-blue-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StockList;