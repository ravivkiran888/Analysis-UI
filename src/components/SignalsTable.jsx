import { formatTimestamp, formatVolume } from "../utils/formatters";

const SignalsTable = ({ data, sortConfig, onSort, selectedSector }) => {
  return (
    
    <div className="overflow-x-auto">
  
    Last Updated: <span className='font-bold'> {formatTimestamp(data?.[0]?.timestamp)} </span>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Symbol</th>
            <th className="hidden sm:table-cell text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Open</th>
            <th className="text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">LTP</th>

            <th
              className="text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium cursor-pointer hover:bg-gray-200 whitespace-nowrap"
              onClick={() => onSort("dayChange")}
            >
              Change
              {sortConfig.key === "dayChange" &&
                (sortConfig.direction === "asc" ? " ↑" : " ↓")}
            </th>

            <th className="text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Day Range</th>

            <th className="text-right py-1 px-0.5 sm:py-2 sm:px-2 font-medium cursor-pointer hover:bg-gray-200 whitespace-nowrap"
              onClick={() => onSort("totalDayVolume")}> Volume

              {sortConfig.key === "totalDayVolume" &&
                (sortConfig.direction === "asc" ? " ↑" : " ↓")}


            </th>

            <th className="text-center py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Signal</th>
            <th className="text-left py-1 px-0.5 sm:py-2 sm:px-2 font-medium whitespace-nowrap">Sector</th>

          </tr>
        </thead>

        <tbody>
          {(!data || data.length === 0) ? (
            <tr>
              <td colSpan={9} className="text-center py-8 text-gray-400 text-sm">
                No symbols found {selectedSector}
              </td>
            </tr>
          ) : (
            data.map((item) => {
              const openLowDiff = item.dayOpen - item.dayLow;
              const highlight = openLowDiff < 0.5;

              return (
                <tr
                  key={item.symbol}
                  className={`border-b hover:bg-gray-100 transition-colors ${highlight ? "bg-green-100" : ""
                    }`}
                  title={highlight ? `Open-Low difference: ${openLowDiff}` : ""}
                >
                  <td className="py-1 px-0.5 sm:py-2 sm:px-2 font-medium text-blue-600 whitespace-nowrap">
                    {item.symbol}
                  </td>

                  <td className="hidden sm:table-cell text-right whitespace-nowrap">
                    {item.dayOpen?.toFixed(2)}
                  </td>

                  <td className="py-1 px-0.5 sm:py-2 sm:px-2 text-right font-bold whitespace-nowrap">
                    {item.lastTradedPrice?.toFixed(2)}
                  </td>

                  <td
                    className={`py-1 px-0.5 sm:py-2 sm:px-2 text-right whitespace-nowrap ${item.dayChange >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {item.dayChange >= 0 ? "+" : ""}
                    {item.dayChange?.toFixed(2)}
                  </td>

                  <td className="py-1 px-0.5 sm:py-2 sm:px-2 text-right whitespace-nowrap">
                    <span className="text-green-600">
                      {item.dayHigh?.toFixed(2)}
                    </span>
                    /
                    <span className="text-red-600">
                      {item.dayLow?.toFixed(2)}
                    </span>
                  </td>

                  <td className="py-1 px-0.5 sm:py-2 sm:px-2 text-right font-mono whitespace-nowrap">
                    {formatVolume(item.totalDayVolume)}
                  </td>

                 
                  <td className="py-1 px-0.5 sm:py-2 sm:px-2 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs ${item.signal === "ENTRY_READY"
                          ? "bg-green-700 text-white font-semibold"
                          : ""
                        }`}
                    >
                      {item.signal}
                    </span>
                  </td>

                  <td className="py-1 px-0.5 sm:py-2 sm:px-2 whitespace-nowrap text-gray-600">
                    {item.sector}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SignalsTable;