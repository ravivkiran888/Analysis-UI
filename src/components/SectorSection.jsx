import { formatTimestamp } from '../utils/formatters'
import { useSectors } from '../hooks/useSectors'

const SectorSection = () => {

  const { data = [], loading, error } = useSectors();

  const lastUpdated = data.length > 0 ? data[0].timestamp : null;

  if (loading) {
    return <div className="mb-6 text-sm text-gray-500">Loading sectors...</div>;
  }

  if (error) {
    return <div className="mb-6 text-sm text-red-500">Failed to load sectors</div>;
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-600">
          SECTORS — Last Updated:
          <span className="font-bold">
            {lastUpdated ? formatTimestamp(lastUpdated) : "—"}
          </span>
        </h4>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
        {data.map((sector) => (
          <div
            key={sector.sector}
            className="border rounded p-3 cursor-pointer hover:shadow"
          >
            <div className="text-xs text-gray-500 uppercase">
              {sector.sector}
            </div>

            <div
              className={`font-bold ${
                sector.dayChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {sector.dayChange > 0 ? "+" : ""}
              {sector.dayChange.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectorSection;