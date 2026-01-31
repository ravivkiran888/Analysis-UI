import { useEffect, useMemo, useState } from "react";


const WatchStocks = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // CORRECT ENDPOINT: /analysis/watch
    fetch(`${API_BASE_URL}/analysis/watch`)  // ← Different endpoint than StockList
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch watch stocks");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ... rest of the component remains the same

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();
    return data.filter((item) =>
      item.symbol.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Format volume
  const formatVol = (v) => {
    if (typeof v === 'string') return v;
    if (v >= 1e6) return (v/1e6).toFixed(2) + 'M';
    if (v >= 1e3) return (v/1e3).toFixed(2) + 'K';
    return v;
  };

  // Signal badge styling
  const getSignalBadgeClass = (state) => {
    switch(state) {
      case 'WATCH': return 'bg-yellow-100 text-yellow-800';
      case 'ENTRY_READY': return 'bg-green-100 text-green-800';
      case 'EXIT_READY': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) return <div className="text-center py-8">Loading watch stocks...</div>;
  
  // Error state
  if (error) return (
    <div className="text-center py-8">
      <div className="text-red-600 mb-2">Error loading watch stocks</div>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">WATCH STOCKS</h3>
          <p className="text-xs text-gray-500">
            {filteredData.length} stocks • Page {currentPage}/{totalPages}
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-48">
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

      {/* Empty State */}
      {filteredData.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border rounded">
          {searchTerm 
            ? `No stocks found for "${searchTerm}"`
            : "No stocks in watch list"
          }
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Symbol</th>
                  <th className="text-left p-2">Signal</th>
                  <th className="text-right p-2">Close</th>
                  <th className="text-right p-2">VWAP</th>
                  <th className="text-right p-2">EMA20</th>
                  <th className="text-right p-2">EMA50</th>
                  <th className="text-right p-2">Vol Ratio</th>
                  <th className="text-right p-2">Last Vol</th>
                  <th className="text-right p-2">Avg Vol</th>
                  <th className="text-right p-2">Curr Vol</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(item => (
                  <tr key={item.symbol} className="border-t hover:bg-gray-50">
                    <td className="p-2 font-medium">{item.symbol}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSignalBadgeClass(item.signalState)}`}>
                        {item.signalState}
                      </span>
                    </td>
                    <td className="p-2 text-right">{item.close.toFixed(2)}</td>
                    <td className="p-2 text-right">{item.vwap.toFixed(2)}</td>
                    <td className="p-2 text-right">{item.ema20.toFixed(2)}</td>
                    <td className="p-2 text-right">{item.ema50.toFixed(2)}</td>
                    <td className={`p-2 text-right font-medium ${item.volumeRatio > 2 ? 'text-green-600' : ''}`}>
                      {item.volumeRatio.toFixed(2)}
                    </td>
                    
                    <td className="p-2 text-right">{formatVol(item.lastVolume)}</td>
                    <td className="p-2 text-right">{formatVol(item.avgVolume)}</td>
                    <td className="p-2 text-right font-medium">{formatVol(item.currentVolume)}</td>
                  </tr>
                ))}
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
                        className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${
                          currentPage === pageNum ? "bg-blue-500 text-white hover:bg-blue-600" : ""
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
        </>
      )}
    </div>
  );
};

export default WatchStocks;