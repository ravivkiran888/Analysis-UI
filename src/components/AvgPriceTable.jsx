import React, { useEffect, useState } from "react";
import { formatTimestamp } from "../utils/formatters";

const AvgPriceTable = () => {
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👉 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const formatNumber = (val) => {
    if (val === null || val === undefined) return "-";
    const num = Number(val);
    return isNaN(num) ? val : num.toFixed(2);
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/signals/avgPrice`) 
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  // 👉 Pagination logic
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  if (loading) {
    return <div className="p-4 text-gray-600">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr className="text-left text-sm font-semibold text-gray-700">
              <th className="p-3">Symbol</th>
                <th className="p-3">AVG-Price</th>
              <th className="p-3">LTP</th>
              <th className="p-3">Day Change</th>
              <th className="p-3">High</th>
              <th className="p-3">Low</th>
              <th className="p-3">Open</th>
              <th className="p-3">Volume</th>
                 <th className="p-3">Last Updated At</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((item, index) => {
              const dayChange = Number(item.dayChange);

              return (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.symbol}</td>
                 <td className="p-3 font-medium">{item.avgPrice}</td>
                  <td className="p-3">
                    {formatNumber(item.lastTradedPrice)}
                  </td>

                  <td
                    className={`p-3 font-medium 
                    ${
                      dayChange > 0
                        ? "text-green-600"
                        : dayChange < 0
                        ? "text-red-600"
                        : ""
                    }`}
                  >
                    {formatNumber(item.dayChange)}
                  </td>

                  <td className="p-3">{formatNumber(item.dayHigh)}</td>
                  <td className="p-3">{formatNumber(item.dayLow)}</td>
                  <td className="p-3">{formatNumber(item.dayOpen)}</td>

                  <td className="p-3">
                    {item.totalDayVolume?.toLocaleString() || "-"}
                  </td>
                  <td className="p-3">{formatTimestamp(item.timestamp)}</td>

                
                    
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() =>
            setCurrentPage((p) => Math.min(p + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AvgPriceTable;