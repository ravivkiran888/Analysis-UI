import { formatTimestamp, formatVolume } from "../utils/formatters";
import { useState } from "react";
import OptionMetricsModal from "./OptionMetricsModal";
import { useFetchAll } from "../hooks/useFetchAll";

const SignalsTable = () => {

  const [selectedSymbol, setSelectedSymbol] = useState(null);

  // Call the hook properly
  const { data } = useFetchAll();;

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">

        {/* Header */}
        <h2 className="font-bold">All Symbols</h2>
        <div className="px-3 py-2 text-sm text-gray-600 border-b bg-gray-50">
          Last Updated:
          <span className="font-semibold ml-1">
            {data?.length ? formatTimestamp(data[0].timestamp) : "--"}
          </span>
        </div>

        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-gray-500 bg-gray-50">
            <tr>
              <th className="text-left py-2 px-2 font-semibold">Symbol</th>
              <th className="hidden sm:table-cell text-right py-2 px-2 font-semibold">Open</th>
              <th className="text-right py-2 px-2 font-semibold">LTP</th>
              <th className="text-right py-2 px-2 font-semibold">Change</th>
              <th className="text-right py-2 px-2 font-semibold">Day Range</th>
              <th className="text-right py-2 px-2 font-semibold">Volume</th>
              <th className="text-center py-2 px-2 font-semibold">Signal</th>
              <th className="text-left py-2 px-2 font-semibold">Sector</th>
              <th className="text-center py-2 px-2 font-semibold">Options</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400 text-sm">
                  No symbols found
                </td>
              </tr>
            ) : (
              data.map((item) => {

                const openLowDiff = item.dayOpen - item.dayLow;
                const highlight = openLowDiff < 0.5;

                return (
                  <tr
                    key={`${item.symbol}-${item.timestamp}`}
                    className={`odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition ${
                      highlight ? "bg-green-50" : ""
                    }`}
                    title={
                      highlight ? `Open-Low difference: ${openLowDiff}` : ""
                    }
                  >

                    {/* Symbol */}
                    <td className="py-2 px-2 font-semibold text-blue-600 hover:underline cursor-pointer whitespace-nowrap">
                      {item.symbol}
                    </td>

                    {/* Open */}
                    <td className="hidden sm:table-cell text-right py-2 px-2 whitespace-nowrap">
                      {item.dayOpen?.toFixed(2)}
                    </td>

                    {/* LTP */}
                    <td className="py-2 px-2 text-right font-semibold text-gray-900 whitespace-nowrap">
                      {item.lastTradedPrice?.toFixed(2)}
                    </td>

                    {/* Change */}
                    <td
                      className={`py-2 px-2 text-right font-semibold whitespace-nowrap ${
                        item.dayChange >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.dayChange >= 0 ? "+" : ""}
                      {item.dayChange?.toFixed(2)}
                    </td>

                    {/* Day Range */}
                    <td className="py-2 px-2 text-right whitespace-nowrap">
                      <span className="text-green-600">
                        {item.dayHigh?.toFixed(2)}
                      </span>
                      <span className="mx-1 text-gray-400">/</span>
                      <span className="text-red-600">
                        {item.dayLow?.toFixed(2)}
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-2 px-2 text-right font-mono whitespace-nowrap">
                      {formatVolume(item.totalDayVolume)}
                    </td>

                    {/* Signal */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.signal === "ENTRY_READY"
                            ? "bg-green-600 text-white"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.signal}
                      </span>
                    </td>

                    {/* Sector */}
                    <td className="py-2 px-2 text-gray-600 whitespace-nowrap">
                      {item.sector}
                    </td>

                    {/* Options */}
                    <td className="py-2 px-2 text-center">
                      {item.isOptionChain && (
                        <button
                          className="text-purple-600 hover:text-purple-800 text-lg"
                          onClick={() => setSelectedSymbol(item.symbol)}
                        >
                          📈
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Option Modal */}
      <OptionMetricsModal
        symbol={selectedSymbol}
        onClose={() => setSelectedSymbol(null)}
      />
    </>
  );
};

export default SignalsTable;