import { formatTimestamp, formatVolume } from "../utils/formatters";
import { useSignals } from "../hooks/useSignals";
import { sortData , toggleSort } from "../utils/sorting";
import { useState } from "react";




const SignalsTable = () => {

  const { data = [], loading, error } = useSignals();

  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("");


const renderArrow = (column) => {
  if (sortColumn !== column) return "";
  return sortDirection === "asc" ? "▲" : "▼";
};

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(toggleSort(sortDirection));
      
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const sortedData = sortColumn
    ? sortData(data, sortColumn, sortDirection)
    : data;

  const lastUpdated = data.length ? data[0].timestamp : null;

  if (loading) {
    return <div className="mb-6 text-sm text-gray-500">Loading signals...</div>;
  }

  if (error) {
    return <div className="mb-6 text-sm text-red-500">Failed to load signals</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">

      <div className="px-3 py-2 text-sm text-gray-600 border-b bg-gray-50">
        Last Updated:
        <span className="font-semibold ml-1">
          {lastUpdated ? formatTimestamp(lastUpdated) : "—"}
        </span>
      </div>

      <table className="w-full text-sm">

        <thead className="text-xs uppercase text-gray-500 bg-gray-50">
          <tr>
            <th className="text-left py-2 px-2 font-semibold">Symbol</th>
            <th className="hidden sm:table-cell text-right py-2 px-2 font-semibold">Open</th>

            <th
              className="text-right py-2 px-2 font-semibold cursor-pointer"
              onClick={() => handleSort("lastTradedPrice")}
            >
              LTP  {renderArrow("lastTradedPrice")}
            </th>

            <th
              className="text-right py-2 px-2 font-semibold cursor-pointer"
              onClick={() => handleSort("dayChange")}
            >
              Change {renderArrow("dayChange")}
            </th>

            <th className="text-right py-2 px-2 font-semibold">Day Range</th>

            <th
              className="text-right py-2 px-2 font-semibold cursor-pointer"
              onClick={() => handleSort("totalDayVolume")}
            >
              Volume {renderArrow("totalDayVolume")}
            </th>

            <th className="text-center py-2 px-2 font-semibold">Signal</th>
            <th className="text-left py-2 px-2 font-semibold">Sector</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">

          {sortedData.map((item) => {

            const openLowDiff = item.dayOpen - item.dayLow;
            const highlight = openLowDiff < 0.5;

            const changeColor =
              item.dayChange >= 0 ? "text-green-600" : "text-red-600";

            const signalStyle =
              item.signal === "ENTRY_READY"
                ? "bg-green-600 text-white"
                : "bg-yellow-100 text-yellow-800";

            return (
              <tr
                key={item.symbol}
                className={`odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition ${highlight ? "bg-green-50" : ""
                  }`}
              >
                <td className="py-2 px-2 font-semibold text-blue-600">
                  {item.symbol}
                </td>

                <td className="hidden sm:table-cell text-right py-2 px-2">
                  {item.dayOpen?.toFixed(2)}
                </td>

                <td className="py-2 px-2 text-right font-semibold">
                  {item.lastTradedPrice?.toFixed(2)}
                </td>

                <td className={`py-2 px-2 text-right font-semibold ${changeColor}`}>
                  {item.dayChange >= 0 ? "+" : ""}
                  {item.dayChange?.toFixed(2)}
                </td>

                <td className="py-2 px-2 text-right">
                  <span className="text-green-600">{item.dayHigh?.toFixed(2)}</span>
                  <span className="mx-1 text-gray-400">/</span>
                  <span className="text-red-600">{item.dayLow?.toFixed(2)}</span>
                </td>

                <td className="py-2 px-2 text-right font-mono">
                  {formatVolume(item.totalDayVolume)}
                </td>

                <td className="py-2 px-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${signalStyle}`}>
                    {item.signal}
                  </span>
                </td>

                <td className="py-2 px-2 text-gray-600">
                  {item.sector === "Unknown" ? "" : item.sector}
                </td>
              </tr>
            );
          })}

        </tbody>
      </table>
    </div>
  );
};

export default SignalsTable;