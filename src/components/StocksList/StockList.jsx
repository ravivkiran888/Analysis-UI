import { useEffect, useMemo, useState } from "react";
import * as CONSTANTS from "../../constants/";

const StockList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return data;

    return data.filter((item) =>
      [item.symbol]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / CONSTANTS.ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * CONSTANTS.ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + CONSTANTS.ITEMS_PER_PAGE);

  const formatVolume = (volume) => {
    if (!volume || volume === 0) return 'Not Available';
    if (volume >= 10000000) {
      return (volume / 10000000).toFixed(2) + 'Cr';
    } else if (volume >= 100000) {
      return (volume / 100000).toFixed(2) + 'L';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(2) + 'K';
    }
    return volume.toString();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  const getVolumeStatus = (expansion) => {
    if (!expansion || expansion === 0) {
      return <span className="text-red-500 font-bold" title="No volume data">⚠️ No vol</span>;
    }
    if (expansion < 1.5) {
      return <span className="text-yellow-500">{expansion.toFixed(1)}x ⚠️</span>;
    }
    if (expansion >= 2.0) {
      return <span className="text-green-500 font-bold">{expansion.toFixed(1)}x ✓</span>;
    }
    return <span>{expansion.toFixed(1)}x</span>;
  };

  // Function to check if row should be highlighted
  const shouldHighlightRow = (item) => {
    if (!item.dayOpen || !item.dayLow) return false;
    const difference = Math.abs(item.dayOpen - item.dayLow);
    return difference < 0.80;
  };

  if (loading) return <div className="p-4 text-sm">Loading entry-ready signals...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">🚀 ENTRY READY SIGNALS</h3>
          <p className="text-xs text-gray-500">
            {filteredData.length} opportunities • Page {currentPage}/{totalPages}
          </p>
        </div>
        
        {/* Search Input */}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
        
      
      
      
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-2 px-2 font-medium">Symbol</th>
              <th className="text-right py-2 px-2 font-medium">Open</th>
              <th className="text-right py-2 px-2 font-medium">LTP</th>
              <th className="text-right py-2 px-2 font-medium">Change</th>
              <th className="text-right py-2 px-2 font-medium">Day Range</th> {/* Merged column */}
              <th className="text-right py-2 px-2 font-medium">Volume Ratio</th>
              <th className="text-right py-2 px-2 font-medium">Total Volume</th>
              <th className="text-right py-2 px-2 font-medium">Last Updated</th>
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
                    highlight ? 'bg-green-100' : ''
                  }`}
                  title={highlight ? `Open-Low difference: ${openLowDiff}` : ''}
                >
                  <td className="py-2 px-2 font-medium text-blue-600">
                    {item.symbol}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {item.dayOpen?.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold">
                    {item.lastTradedPrice?.toFixed(2)}
                  </td>
                  <td className={`py-2 px-2 text-right ${
                    item.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.dayChange >= 0 ? '+' : ''}{item.dayChange?.toFixed(2)}
                  </td>
                  {/* New combined Day Range cell */}
                  <td className="py-2 px-2 text-right">
                    <span className="text-green-600">{item.dayHigh?.toFixed(2)}</span>
                    {' / '}
                    <span className="text-red-600">{item.dayLow?.toFixed(2)}</span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    {getVolumeStatus(item.volumeExpansion)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    {formatVolume(item.totalDayVolume)}
                  </td>
                  <td className="py-2 px-2 text-right text-xs text-gray-500">
                    {formatTimestamp(item.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
            >
              ←
            </button>
            <span className="px-2 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
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
          No entry-ready signals found
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default StockList;