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

      {/* 🔹 Title */}
      <h2 className="text-xl font-semibold mb-4">
        Support & Breakout Signals
      </h2>

      {/* 🔹 TOP INFO PANEL */}
      <div className="mb-4 p-4 bg-gray-50 border rounded-lg shadow-sm">

        <h3 className="text-lg font-semibold mb-2">
          Signal Definitions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

          {/* SUPPORT_BOUNCE */}
          <div className="p-3 border rounded bg-white">
            <p className="font-semibold text-blue-600 mb-1">
              SUPPORT_BOUNCE
            </p>
            <p>
              Price is near previous support and trading above today's open.
            </p>
            <p className="text-gray-600 mt-1">
              ➤ Possible reversal zone. Wait for confirmation.
            </p>
          </div>

          {/* BREAK_RESISTANCE */}
          <div className="p-3 border rounded bg-white">
            <p className="font-semibold text-green-600 mb-1">
              BREAK_RESISTANCE
            </p>
            <p>
              Price has just broken above resistance within a tight range.
            </p>
            <p className="text-gray-600 mt-1">
              ➤ Early breakout. Look for volume confirmation.
            </p>
          </div>

        </div>

        {/* 🔹 Legend */}
        <div className="mt-3 text-xs text-gray-600">
          <p>🟢 Breakout → Momentum trade</p>
          <p>🔵 Support Bounce → Reversal trade</p>
          <p>⚠️ Always confirm with volume</p>
        </div>

      </div>

      {/* 🔹 TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 shadow-md rounded-lg">
          
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Symbol</th>
              <th className="px-4 py-2 border">Sector</th>
              <th className="px-4 py-2 border">LTP</th>
              <th className="px-4 py-2 border">Open</th>
              <th className="px-4 py-2 border">Low</th>
              <th className="px-4 py-2 border">Prev Low</th>
              <th className="px-4 py-2 border">Prev High</th>
              <th className="px-4 py-2 border">Volume</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => {
                
                const isBullish =
                  Number(item.lastTradedPrice) > Number(item.dayOpen);

                return (
                  <tr key={index} className="text-center hover:bg-gray-50">

                    <td className="px-4 py-2 border font-medium">
                      {item.symbol}
                    </td>

                    <td className="px-4 py-2 border">
                      {item.sector}
                    </td>

                    <td className="px-4 py-2 border font-semibold">
                      {item.lastTradedPrice}
                    </td>

                    {/* Open */}
                    <td className={`px-4 py-2 border ${
                      isBullish ? "text-green-600" : "text-red-500"
                    }`}>
                      {item.dayOpen}
                    </td>

                    {/* Low */}
                    <td className="px-4 py-2 border">
                      {item.dayLow}
                    </td>

                    <td className="px-4 py-2 border">
                      {item.prevLowD}
                    </td>

                    <td className="px-4 py-2 border">
                      {item.prevHighD}
                    </td>

                    <td className="px-4 py-2 border">
                      {item.totalDayVolume?.toLocaleString()}
                    </td>

                    {/* Category */}
                    <td
                      className={`px-4 py-2 border font-semibold ${
                        item.category === "BREAK_RESISTANCE"
                          ? "text-green-600"
                          : item.category === "SUPPORT_BOUNCE"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {item.category}
                    </td>

                    <td className="px-4 py-2 border text-sm">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 PAGINATION */}
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