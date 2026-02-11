import { useEffect, useMemo, useState } from "react";
import * as CONSTANTS from "../../constants/";

const StockList = () => {

  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pivot points modal state
  const [pivotData, setPivotData] = useState(null);
  const [currentLTP, setCurrentLTP] = useState(null);
  const [pivotLoading, setPivotLoading] = useState(false);
  const [pivotError, setPivotError] = useState(null);
  const [showPivotModal, setShowPivotModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  
  // Manual symbol input
  const [manualSymbol, setManualSymbol] = useState("");
  const [manualSymbolError, setManualSymbolError] = useState("");


  useEffect(() => {

      console.log("All env vars 33:", CONSTANTS.ITEMS_PER_PAGE);


    fetch(`${import.meta.env.VITE_API_BASE_URL}/analysis/ready`)
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

  // Function to fetch pivot points for any symbol
  const fetchPivotPoints = async (symbol, ltp = null) => {
    setSelectedSymbol(symbol);
    setCurrentLTP(ltp);
    setPivotLoading(true);
    setPivotError(null);
    setManualSymbolError("");
    setPivotData(null);
    setShowPivotModal(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/analysis/api/pivot/${symbol}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Symbol "${symbol}" not found`);
        }
        throw new Error(`Failed to fetch pivot points: ${response.status}`);
      }
      
      const data = await response.json();
      setPivotData(data);
    } catch (err) {
      setPivotError(err.message);
      console.error("Error fetching pivot points:", err);
    } finally {
      setPivotLoading(false);
    }
  };

  // Handle manual symbol submission
  const handleManualSymbolSubmit = (e) => {
    e.preventDefault();
    const symbol = manualSymbol.trim().toUpperCase();
    
    if (!symbol) {
      setManualSymbolError("Please enter a symbol");
      return;
    }
    
    if (symbol.length < 2 || symbol.length > 10) {
      setManualSymbolError("Symbol must be 2-10 characters");
      return;
    }
    
    // Clear previous errors
    setManualSymbolError("");
    
    // Fetch pivot points
    fetchPivotPoints(symbol);
    
    // Clear input
    setManualSymbol("");
  };

  // Close pivot modal
  const closePivotModal = () => {
    setShowPivotModal(false);
    setPivotData(null);
    setCurrentLTP(null);
    setPivotError(null);
    setSelectedSymbol("");
  };

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

  const totalPages = Math.ceil(filteredData.length / CONSTANTS.ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * CONSTANTS.ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + CONSTANTS.ITEMS_PER_PAGE);

  const formatVolume = (volume) => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(2) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(2) + 'K';
    }
    return volume.toString();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) return <div className="p-4 text-sm">Loading...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-4xl mx-auto">
      {/* Header with Search and Manual Symbol Input */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">ENTRY READY SIGNALS</h3>
          <p className="text-xs text-gray-500">
            {filteredData.length} items • Page {currentPage}/{totalPages}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Manual Symbol Input */}
          <div className="relative">
            <form onSubmit={handleManualSymbolSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualSymbol}
                onChange={(e) => {
                  setManualSymbol(e.target.value.toUpperCase());
                  setManualSymbolError("");
                }}
                placeholder="Enter symbol (e.g., RELIANCE)"
                className="w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none whitespace-nowrap"
              >
                Get Pivot
              </button>
            </form>
            {manualSymbolError && (
              <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                {manualSymbolError}
              </div>
            )}
          </div>
          
          {/* Search Input */}
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="Search in table..."
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
      </div>

      {/* Info Banner */}
      <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
        💡 Click any symbol in the table or enter a symbol above to view pivot points
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
              <th className="text-right py-2 px-2 font-medium">LTP</th>
              <th className="text-right py-2 px-2 font-medium">Net Chg</th>
              <th className="text-right py-2 px-2 font-medium">Volume</th>
              <th className="text-left py-2 px-2 font-medium">Sector</th>
              <th className="text-right py-2 px-2 font-medium">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (


                

               <tr 
      key={item.symbol} 
      className={`border-b hover:bg-gray-50 ${
        Math.abs(item.open - item.low) < 0.50 ? 'bg-green-100' : ''
      }`}
    >
                <td className="py-2 px-2">
                  <button
                    onClick={() => fetchPivotPoints(item.symbol, item.lastTradedPrice)}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                    title={`Click to view pivot points for ${item.symbol}`}
                  >
                    {item.symbol}
                  </button>
                </td>
                
                <td className="py-2 px-2 text-right">{item.open?.toFixed(2)}</td>
                <td className="py-2 px-2 text-right">{item.high?.toFixed(2)}</td>
                <td className="py-2 px-2 text-right">{item.low?.toFixed(2)}</td>
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
                  {formatTimestamp(item.evaluatedAt)}
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
            Showing {Math.min(paginatedData.length, CONSTANTS.ITEMS_PER_PAGE)} of {filteredData.length}
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

      {/* Simple Pivot Points Modal */}
      {showPivotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-gray-800">
                {selectedSymbol}
              </h3>
              <button
                onClick={closePivotModal}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none transition-all duration-200 shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {pivotLoading && (
                <div className="text-center py-4 text-gray-500">
                  Loading pivot points...
                </div>
              )}

              {pivotError && (
                <div className="text-center py-4">
                  <div className="text-red-500 text-sm mb-2">{pivotError}</div>
                  <div className="text-xs text-gray-500">
                    Try entering a different symbol
                  </div>
                </div>
              )}

              {pivotData && (
                <div className="space-y-4">
                  {/* Current LTP if available */}
                  {currentLTP && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Current Price</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {currentLTP.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {/* Pivot Point */}
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Pivot Point</div>
                    <div className="text-xl font-bold text-blue-600">
                      {typeof pivotData.pivot === 'number' 
                        ? pivotData.pivot.toFixed(2) 
                        : pivotData.pivot}
                    </div>
                    {currentLTP && (
                      <div className={`text-xs mt-1 ${
                        currentLTP > pivotData.pivot ? 'text-green-600' : 
                        currentLTP < pivotData.pivot ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {currentLTP > pivotData.pivot ? 'Above' : 
                         currentLTP < pivotData.pivot ? 'Below' : 'Equal to'} pivot
                      </div>
                    )}
                  </div>

                  {/* Support & Resistance Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Resistances */}
                    <div>
                      <div className="text-center text-xs text-green-600 font-medium mb-2">
                        Resistances
                      </div>
                      <div className="space-y-1">
                        {['r1', 'r2', 'r3'].map((level, index) => (
                          <div key={level} className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <span className="text-xs font-medium">R{index + 1}</span>
                            <span className="text-sm">
                              {typeof pivotData.resistances?.[level] === 'number' 
                                ? pivotData.resistances[level].toFixed(2) 
                                : pivotData.resistances?.[level]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Supports */}
                    <div>
                      <div className="text-center text-xs text-red-600 font-medium mb-2">
                        Supports
                      </div>
                      <div className="space-y-1">
                        {['s1', 's2', 's3'].map((level, index) => (
                          <div key={level} className="flex justify-between items-center p-2 bg-red-50 rounded">
                            <span className="text-xs font-medium">S{index + 1}</span>
                            <span className="text-sm">
                              {typeof pivotData.supports?.[level] === 'number' 
                                ? pivotData.supports[level].toFixed(2) 
                                : pivotData.supports?.[level]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="text-center text-xs text-gray-400 pt-2 border-t">
                    Based on {pivotData.date} data
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t">
              <button
                onClick={closePivotModal}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockList;