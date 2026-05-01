import { useEffect, useState, useCallback } from "react";

// ── Helpers ────────────────────────────────────────────────────────────────
const BIAS_RANK = { BULLISH: 2, NEUTRAL: 1, BEARISH: 0 };

const sortBullishFirst = (a, b) => {
  const d = BIAS_RANK[b.bias] - BIAS_RANK[a.bias];
  return d !== 0 ? d : (b.confidence ?? 0) - (a.confidence ?? 0);
};

// ── Signal Card ────────────────────────────────────────────────────────────
function SignalCard({ data }) {
  const ceOIChange = data.ce?.prev_oi
    ? ((data.ce.oi - data.ce.prev_oi) / data.ce.prev_oi) * 100
    : 0;

  const peOIChange = data.pe?.prev_oi
    ? ((data.pe.oi - data.pe.prev_oi) / data.pe.prev_oi) * 100
    : 0;

  const ceStrong = data.ce?.oi > data.pe?.oi;

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm mb-5">

      {/* Header */}
      <div className="flex justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">{data.symbol}</h2>
          <p className="text-xs text-gray-500">
            LTP ₹{data.ltp} | ATM {data.atm_strike}
          </p>
        </div>
        <span className="text-sm font-medium">{data.action}</span>
      </div>

      {/* 🔥 CE vs PE */}
      <div className="grid grid-cols-[1fr_auto_1fr] border rounded-xl overflow-hidden mb-4">

        {/* CE */}
        <div className="bg-green-50 p-3">
          <div className="text-xs font-semibold text-green-700 mb-1">
            CALLS (CE)
          </div>

          <div className="text-lg font-bold">₹{data.ce.ltp}</div>

          <div className="text-xs text-gray-600">
            OI: {data.ce.oi} | Vol: {data.ce.volume}
          </div>

          <div className={`text-xs font-medium ${
            ceOIChange >= 0 ? "text-green-600" : "text-red-500"
          }`}>
            {ceOIChange >= 0 ? "↑" : "↓"} {Math.abs(ceOIChange).toFixed(1)}%
          </div>

          <div className="text-xs text-gray-500">
            IV: {data.ce.iv}%
          </div>

          {ceStrong && (
            <span className="text-xs mt-1 inline-block bg-green-200 px-2 py-0.5 rounded">
              🔥 Strong
            </span>
          )}
        </div>

        <div className="flex items-center justify-center px-2 text-xs text-gray-400 bg-gray-50">
          VS
        </div>

        {/* PE */}
        <div className="bg-red-50 p-3 text-right">
          <div className="text-xs font-semibold text-red-700 mb-1">
            PUTS (PE)
          </div>

          <div className="text-lg font-bold">₹{data.pe.ltp}</div>

          <div className="text-xs text-gray-600">
            OI: {data.pe.oi} | Vol: {data.pe.volume}
          </div>

          <div className={`text-xs font-medium ${
            peOIChange >= 0 ? "text-red-600" : "text-green-500"
          }`}>
            {peOIChange >= 0 ? "↑" : "↓"} {Math.abs(peOIChange).toFixed(1)}%
          </div>

          <div className="text-xs text-gray-500">
            IV: {data.pe.iv}%
          </div>

          {!ceStrong && (
            <span className="text-xs mt-1 inline-block bg-red-200 px-2 py-0.5 rounded">
              🔥 Strong
            </span>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
        <div className="bg-gray-50 p-2 rounded">
          PCR: <b>{data.pcr.toFixed(2)}</b>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          Confidence: <b>{data.confidence}</b>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          Bias: <b>{data.bias}</b>
        </div>
      </div>

      {/* 🔍 WHY THIS SIGNAL */}
      <div className="border-t pt-3">
        <div className="text-xs text-gray-400 mb-2 uppercase">
          Why this signal?
        </div>

        <ul className="text-sm text-gray-700 space-y-1">

          <li>
            📊 PCR {data.pcr.toFixed(2)} →{" "}
            {data.pcr > 1.2
              ? "Strong put writing → Support → Bullish"
              : data.pcr < 0.8
              ? "Call dominance → Resistance → Bearish"
              : "Balanced"}
          </li>

          {data.factors?.oi_build_up && (
            <li>
              📌 OI Build-up: <b>{data.factors.oi_build_up}</b>
            </li>
          )}

          <li>
            💰 Premium: CE ₹{data.ce.ltp} vs PE ₹{data.pe.ltp} →{" "}
            {data.ce.ltp > data.pe.ltp
              ? "Upside momentum"
              : "Downside pressure"}
          </li>

          {data.factors?.iv_trend && (
            <li>
              ⚡ IV: {data.factors.iv_trend}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function OptionsDashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;



  const fetchData = useCallback(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/signals/options`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // ✅ Only once (no refresh loop)
  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data
    .filter(d =>
      d.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort(sortBullishFirst);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="max-w-3xl mx-auto p-6">

      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Options Signals</h1>

      
      </div>

      {/* Search */}
      <input
        className="w-full border px-3 py-2 mb-4 rounded"
        placeholder="Search symbol..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* Cards */}
      {paginated.map((item, i) => (
        <SignalCard key={i} data={item} />
      ))}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Prev
        </button>

        <span>Page {page} / {totalPages || 1}</span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>

    </div>
  );
}