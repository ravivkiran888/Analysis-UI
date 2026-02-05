import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 20;

const StockList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // StockList.jsx - should have this
useEffect(() => {
  // CORRECT ENDPOINT: /analysis/ready
  fetch(`${API_BASE_URL}/analysis/ready`)  // ← Different endpoint than WatchStocks
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch data");
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

 const filteredData = useMemo(() => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return data;

  return data.filter((item) =>
    [item.symbol, item.sector]
      .filter(Boolean) // removes null / undefined
      .some((field) => field.toLowerCase().includes(term))
  );
}, [data, searchTerm]);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) return <div className="p-4 text-sm">Loading...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-4xl mx-auto">
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">BULLISH</h3>
          <p className="text-xs text-gray-500">
            {filteredData.length} items • Page {currentPage}/{totalPages}
          </p>
        </div>
        
        <div className="relative w-48">
          <input
            type="text"
            placeholder="Search..."
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
              <th className="text-right py-2 px-2 font-medium">Close</th>
              <th className="text-right py-2 px-2 font-medium">VWAP</th>
              <th className="text-right py-2 px-2 font-medium">EMA20</th>
              <th className="text-right py-2 px-2 font-medium">EMA50</th>
              <th className="text-right py-2 px-2 font-medium">Vol Ratio</th>
              <th className="text-right py-2 px-2 font-medium">Last Vol</th>
              <th className="text-right py-2 px-2 font-medium">Avg Vol</th>
              <th className="text-right py-2 px-2 font-medium">Curr Vol</th>
               <th className="text-right py-2 px-2 font-medium">Sector</th>
               <th className="text-right py-2 px-2 font-medium">Updated On</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.symbol} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2 font-medium">{item.symbol}</td>
                <td className="py-2 px-2 text-right">{item.close.toFixed(2)}</td>
                <td className="py-2 px-2 text-right">{item.vwap.toFixed(2)}</td>
                <td className="py-2 px-2 text-right">{item.ema20.toFixed(2)}</td>
                <td className="py-2 px-2 text-right">{item.ema50.toFixed(2)}</td>
                <td className="py-2 px-2 text-right font-medium">
                  <span className={item.volumeRatio >= 2 ? "text-green-600" : "text-gray-600"}>
                    {item.volumeRatio.toFixed(2)}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  {typeof item.lastVolume === 'string' 
                    ? item.lastVolume 
                    : (item.lastVolume >= 1000000 
                      ? (item.lastVolume/1000000).toFixed(2) + 'M'
                      : (item.lastVolume/1000).toFixed(2) + 'K'
                    )}
                </td>
                <td className="py-2 px-2 text-right">
                  {typeof item.avgVolume === 'string' 
                    ? item.avgVolume 
                    : (item.avgVolume >= 1000000 
                      ? (item.avgVolume/1000000).toFixed(2) + 'M'
                      : (item.avgVolume/1000).toFixed(2) + 'K'
                    )}
                </td>
                <td className="py-2 px-2 text-right font-medium">
                  {typeof item.currentVolume === 'string' 
                    ? item.currentVolume 
                    : (item.currentVolume >= 1000000 
                      ? (item.currentVolume/1000000).toFixed(2) + 'M'
                      : (item.currentVolume/1000).toFixed(2) + 'K'
                    )}
                </td>

                
                  <td className="py-2 px-2 text-right">
  {item.sector}
</td>
                  
                  <td className="py-2 px-2 text-right">
  {new Date(item.updatedAt).toLocaleString()}
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
            Showing {paginatedData.length} of {filteredData.length}
          </div>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-30"
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
                      currentPage === pageNum ? "bg-blue-500 text-white" : ""
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
              className="px-2 py-1 text-sm border rounded disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockList;