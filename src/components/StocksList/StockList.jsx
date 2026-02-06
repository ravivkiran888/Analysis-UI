import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 20;

const StockList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/analysis/ready`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((json) => {
        // Ensure we handle both single object and array responses
        if (Array.isArray(json)) {
          setData(json);
        } else {
          // If it's a single object, wrap it in an array
          setData([json]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Helper function to truncate sector text
  const truncateSector = (sector) => {
    if (!sector) return '';
    if (sector.length <= 10) return sector;
    return sector.substring(0, 10) + '...';
  };

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return data;

    return data.filter((item) =>
      [item.symbol, item.sector]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Helper function to format volume
  const formatVolume = (volume) => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(2) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(2) + 'K';
    }
    return volume.toString();
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) return <div className="p-4 text-sm">Loading...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-4xl mx-auto">
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">ENTRY READY SIGNALS</h3>
          <p className="text-xs text-gray-500">
            {filteredData.length} items • Page {currentPage}/{totalPages}
          </p>
        </div>
        
        <div className="relative w-48">
          <input
            type="text"
            placeholder="Search symbol or sector..."
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

      {/* Compact Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-medium">Symbol</th>
              <th className="text-right py-2 px-2 font-medium">Open</th>
              <th className="text-right py-2 px-2 font-medium">High</th>
              <th className="text-right py-2 px-2 font-medium">Low</th>
              <th className="text-right py-2 px-2 font-medium">Close</th>
              <th className="text-right py-2 px-2 font-medium">LTP</th>
              <th className="text-right py-2 px-2 font-medium">Net Chg</th>
              <th className="text-right py-2 px-2 font-medium">Volume</th>
              <th className="text-left py-2 px-2 font-medium">Sector</th>
              <th className="text-right py-2 px-2 font-medium">VWAP Updated</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.symbol} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2 font-medium">{item.symbol}</td>
                
                <td className="py-2 px-2 text-right">{item.open?.toFixed(2)}</td>
                <td className="py-2 px-2 text-right">{item.high?.toFixed(2)}</td>
                <td className="py-2 px-2 text-right">{item.low?.toFixed(2)}</td>
                <td className="py-2 px-2 text-right">{item.close?.toFixed(2)}</td>
                <td className="py-2 px-2 text-right font-medium">
                  {item.lastTradedPrice?.toFixed(2)}
                </td>
                <td className={`py-2 px-2 text-right font-medium ${
                  item.netChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.netChange >= 0 ? '+' : ''}{item.netChange?.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-right">
                  {formatVolume(item.volume || 0)}
                </td>
                <td className="py-2 px-2" title={item.sector || ''}>
                  {truncateSector(item.sector)}
                </td>
                <td className="py-2 px-2 text-right text-xs text-gray-500">
                  {formatTimestamp(item.vwapUpdatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Minimal Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3 pt-3 border-t">
          <div className="text-xs text-gray-500">
            Showing {Math.min(paginatedData.length, ITEMS_PER_PAGE)} of {filteredData.length}
          </div>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
            >
              ←
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = currentPage <= 3 
                ? i + 1 
                : currentPage >= totalPages - 2 
                ? totalPages - 4 + i 
                : currentPage - 2 + i;
              
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2 py-1 text-sm border rounded ${
                      currentPage === pageNum 
                        ? "bg-blue-500 text-white border-blue-500" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
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

      {/* Show empty state */}
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