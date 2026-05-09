import React, { useState } from "react";

const PivotLevels = () => {

  const [symbol, setSymbol] = useState("");

  const [pivotData, setPivotData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSearch = () => {

    if (!symbol.trim()) {

      setError("Please enter a symbol");

      return;
    }

    setLoading(true);

    setError("");

    setPivotData(null);
  
       fetch(`${import.meta.env.VITE_API_BASE_URL}/api/signals/pivot/${symbol}`)
    
      .then((response) => {

        if (!response.ok) {

          throw new Error("Symbol not found");
        }

        return response.json();
      })
      .then((data) => {

        setPivotData(data);
      })
      .catch((err) => {

        setError(err.message);
      })
      .finally(() => {

        setLoading(false);
      });
  };

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-6xl mx-auto">

        {/* Main Container */}
        <div className="bg-white rounded-3xl shadow-lg p-6">

          {/* Heading */}
          <div className="mb-6">

            <h1 className="text-3xl font-bold text-gray-800">
              Pivot Levels
            </h1>

            <p className="text-gray-500 mt-1">
              Search intraday support and resistance levels
            </p>

          </div>

          {/* Search Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">

            <input
              type="text"
              placeholder="Enter Symbol (Example: BANKINDIA)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyDown={(e) => {

                if (e.key === "Enter") {

                  handleSearch();
                }
              }}
              className="
                flex-1
                border
                border-gray-300
                rounded-2xl
                px-5
                py-3
                text-base
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

            <button
              onClick={handleSearch}
              className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-6
                py-3
                rounded-2xl
                font-semibold
                transition
              "
            >
              Search
            </button>

          </div>

          {/* Loading */}
          {loading && (

            <div className="text-blue-600 font-medium">
              Loading...
            </div>
          )}

          {/* Error */}
          {error && (

            <div className="
              bg-red-100
              border
              border-red-200
              text-red-700
              px-4
              py-3
              rounded-2xl
              mb-6
            ">
              {error}
            </div>
          )}

          {/* Data Section */}
          {pivotData && (

            <div>

              {/* Symbol */}
              <div className="mb-6">

                <h2 className="text-2xl font-bold text-gray-800">
                  {pivotData.symbol}
                </h2>

              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Pivot */}
                <div className="
                  bg-yellow-50
                  border
                  border-yellow-200
                  rounded-2xl
                  p-6
                  shadow-sm
                  flex
                  flex-col
                  justify-center
                ">

                  <p className="text-gray-600 text-sm font-medium mb-2">
                    Pivot Point
                  </p>

                  <h2 className="text-4xl font-bold text-yellow-700">
                    {pivotData.pivotPoint}
                  </h2>

                </div>

                {/* Resistance Column */}
                <div className="space-y-4">

                  {/* R1 */}
                  <div className="
                    bg-emerald-50
                    border
                    border-emerald-200
                    rounded-2xl
                    p-5
                    shadow-sm
                  ">

                    <p className="text-gray-600 text-sm font-medium mb-2">
                      Resistance 1
                    </p>

                    <h2 className="text-3xl font-bold text-emerald-700">
                      {pivotData.r1}
                    </h2>

                  </div>

                  {/* R2 */}
                  <div className="
                    bg-emerald-50
                    border
                    border-emerald-200
                    rounded-2xl
                    p-5
                    shadow-sm
                  ">

                    <p className="text-gray-600 text-sm font-medium mb-2">
                      Resistance 2
                    </p>

                    <h2 className="text-3xl font-bold text-emerald-700">
                      {pivotData.r2}
                    </h2>

                  </div>

                  {/* R3 */}
                  <div className="
                    bg-emerald-50
                    border
                    border-emerald-200
                    rounded-2xl
                    p-5
                    shadow-sm
                  ">

                    <p className="text-gray-600 text-sm font-medium mb-2">
                      Resistance 3
                    </p>

                    <h2 className="text-3xl font-bold text-emerald-700">
                      {pivotData.r3}
                    </h2>

                  </div>

                </div>

                {/* Support Column */}
                <div className="space-y-4">

                  {/* S1 */}
                  <div className="
                    bg-rose-50
                    border
                    border-rose-200
                    rounded-2xl
                    p-5
                    shadow-sm
                  ">

                    <p className="text-gray-600 text-sm font-medium mb-2">
                      Support 1
                    </p>

                    <h2 className="text-3xl font-bold text-rose-700">
                      {pivotData.s1}
                    </h2>

                  </div>

                  {/* S2 */}
                  <div className="
                    bg-rose-50
                    border
                    border-rose-200
                    rounded-2xl
                    p-5
                    shadow-sm
                  ">

                    <p className="text-gray-600 text-sm font-medium mb-2">
                      Support 2
                    </p>

                    <h2 className="text-3xl font-bold text-rose-700">
                      {pivotData.s2}
                    </h2>

                  </div>

                  {/* S3 */}
                  <div className="
                    bg-rose-50
                    border
                    border-rose-200
                    rounded-2xl
                    p-5
                    shadow-sm
                  ">

                    <p className="text-gray-600 text-sm font-medium mb-2">
                      Support 3
                    </p>

                    <h2 className="text-3xl font-bold text-rose-700">
                      {pivotData.s3}
                    </h2>

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default PivotLevels;