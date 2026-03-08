import { useEffect, useState } from "react";
import { formatTimestamp } from "../utils/formatters";



const MetricCard = ({ label, value }) => {
  let bg = "bg-gray-50 border border-gray-200";
  let textColor = "text-gray-800";

  if (label.includes("SUPPORT")) bg = "bg-green-50 border-green-200";
  if (label.includes("RESISTANCE")) bg = "bg-red-50 border-red-200";
  if (label.includes("CE OI") || label.includes("CE VOLUME")) bg = "bg-blue-50 border-blue-200";
  if (label.includes("PE OI") || label.includes("PE VOLUME")) bg = "bg-orange-50 border-orange-200";
  if (label === "ATM") bg = "bg-yellow-50 border-yellow-200";

  return (
    <div
      className={`${bg} rounded-lg p-3 shadow-sm text-center hover:shadow-md transition`}
    >
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-lg font-semibold ${textColor}`}>{value}</div>
    </div>
  );
};

const OptionMetricsModal = ({ symbol, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [optionData, setOptionData] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchOptionData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/signals/${symbol}`
        );

        const data = await response.json();

        const formattedData = {
          ...data,
          updatedAt: formatTimestamp(data.updatedAt, true),
        };

        setOptionData(formattedData);
      } catch (error) {
        console.error("Failed to fetch option metrics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptionData();
  }, [symbol]);

  if (!symbol) return null;

  // CE vs PE OI strength calculation for visual bar
  let cePercentage = 50;
  let pePercentage = 50;
  if (optionData?.atmCallOI && optionData?.atmPutOI) {
    const total = optionData.atmCallOI + optionData.atmPutOI;
    cePercentage = Math.round((optionData.atmCallOI / total) * 100);
    pePercentage = 100 - cePercentage;
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-[740px] max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h2 className="font-semibold text-lg">Option Metrics - {symbol}    -  {optionData?.currentPrice}</h2>
          <button className="text-gray-500 hover:text-black text-lg" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-4">
          {loading && <div className="text-gray-500">Loading option data...</div>}

          {!loading && optionData && (
            <>
              {/* Static Indicator Guide */}
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                <div className="font-semibold text-blue-800 mb-2">ℹ Market Interpretation</div>
                <ul className="space-y-1 text-gray-700">
                  <li>🟢 <span className="font-medium text-green-700">PE OI &gt;&gt; CE OI</span> → Support forming</li>
                  <li>🔴 <span className="font-medium text-red-700">CE OI &gt;&gt; PE OI</span> → Resistance forming</li>
                </ul>
              </div>

              {/* Key Levels */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Key Levels</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard label="SUPPORT" value={optionData.support} />
                  <MetricCard label="RESISTANCE" value={optionData.resistance} />
                  <MetricCard label="CURRENT PRICE" value={optionData.currentPrice} />
                  <MetricCard label="ATM" value={optionData.atm} />
                </div>
              </div>

              {/* Option Activity */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Option Activity</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard label="ATM CE OI" value={optionData.atmCallOI} />
                  <MetricCard label="ATM PE OI" value={optionData.atmPutOI} />
                </div>
              </div>

              {/* CE vs PE OI Strength Bar */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 mb-1 uppercase">ATM OI Strength</div>
                <div className="flex items-center mb-1 text-xs text-gray-600">CE</div>
                <div className="h-2 w-full bg-blue-100 rounded mb-2">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: `${cePercentage}%` }}></div>
                </div>
                <div className="flex items-center mb-1 text-xs text-gray-600">PE</div>
                <div className="h-2 w-full bg-orange-100 rounded">
                  <div className="h-2 bg-orange-500 rounded" style={{ width: `${pePercentage}%` }}></div>
                </div>
              </div>

              {/* Volume */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Volume</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard label="ATM CE VOLUME" value={optionData.atmCallVolume} />
                  <MetricCard label="ATM PE VOLUME" value={optionData.atmPutVolume} />
                  <MetricCard label="ATM TOTAL VOLUME" value={optionData.atmTotalVolume} />
                  <MetricCard label="UPDATED AT" value={optionData.updatedAt} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionMetricsModal;