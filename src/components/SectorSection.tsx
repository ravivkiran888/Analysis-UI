import { useState } from "react";
import { useSectors } from "../hooks/useSectors";
import { formatTimestamp } from "../utils/formatters";

type Props = {
  onSectorSelect: (sector: string | null) => void;
};

const SectorSection = ({ onSectorSelect }: Props) => {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const { data, loading, error } = useSectors();

  const lastUpdated =
    data.length > 0 ? data[0].timestamp : null;

  if (loading) {
    return <div>Loading sectors...</div>;
  }

  if (error) {
    return <div>Failed to load sectors</div>;
  }

  const handleClick = (sectorCode: string) => {
    if (sectorCode === selectedSector) {
      setSelectedSector(null);
      onSectorSelect(null);
    } else {
      setSelectedSector(sectorCode);
      onSectorSelect(sectorCode);
    }
  };

  return (
    <div className="mb-6">
      <h4>
        SECTORS — Last Updated:
        <span>
          {lastUpdated ? formatTimestamp(lastUpdated) : "—"}
        </span>
      </h4>

      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
        {data.map((sector) => (
          <div
            key={sector.sector} // unique code
            onClick={() => handleClick(sector.sector)}
            className="border rounded p-3 cursor-pointer"
          >
            <div className="text-xs text-gray-500 uppercase">
              {sector.name}
            </div>

            <div
              className={`font-bold ${
                sector.dayChange >= 0
                  ? "text-green-600"
                  : "text-red-600"
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