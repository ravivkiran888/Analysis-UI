import React, { useEffect, useState } from "react";

const PAGE_SIZE = 20;

const SupportBreakoutTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/signals/support-breakout`)
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentData = data.slice(startIndex, startIndex + PAGE_SIZE);

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const goToPrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Support & Breakout Signals
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Symbol</th>
              <th className="px-4 py-2 border">Sector</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Prev Low</th>
              <th className="px-4 py-2 border">Prev High</th>
              <th className="px-4 py-2 border">Volume</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={index} className="text-center hover:bg-gray-50">
                  <td className="px-4 py-2 border font-medium">
                    {item.symbol}
                  </td>
                  <td className="px-4 py-2 border">{item.sector}</td>
                  <td className="px-4 py-2 border">
                    {item.lastTradedPrice}
                  </td>
                  <td className="px-4 py-2 border">{item.prevLowD}</td>
                  <td className="px-4 py-2 border">{item.prevHighD}</td>
                  <td className="px-4 py-2 border">
                    {item.totalDayVolume?.toLocaleString()}
                  </td>
                  <td
                    className={`px-4 py-2 border font-semibold ${
                      item.category === "BREAK_RESISTANCE"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {item.category}
                  </td>
                  <td className="px-4 py-2 border text-sm">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          onClick={goToNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SupportBreakoutTable;