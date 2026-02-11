import { useState } from 'react';

const UsdInrWidget = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full max-w-md">
      {loading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-gray-500">Loading market data...</div>
        </div>
      )}
      
      <iframe
        title="USD INR Technical Summary"
        src="https://ssltsw.investing.com?lang=56&forex=160,1646,1,2,3,5,9&commodities=8830,8836,8831,8849,8833,8862,8832&indices=23660,166,172,27,179,53094,170&stocks=345,346,347,348,349,350,352&tabs=1,2,3,4"
        className="w-full h-80 border-0 rounded-lg shadow-lg"
        loading="lazy"
        onLoad={() => setLoading(false)}
        style={{ minHeight: '320px' }}
      />
    </div>
  );
};

export default UsdInrWidget;
