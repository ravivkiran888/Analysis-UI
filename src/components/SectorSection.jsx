import {formatTimestamp} from '../utils/formatters'

const SectorSection = ({
  sectors,
  selectedSector,
  selectedSectorGroup,
  onSelectSector,
  onClear,
}) => {
  if (!sectors?.length) return null;


const handleOnClick = (sectorName) => {

  if (selectedSector === sectorName) {
    onClear();
  } else {
    onSelectSector(sectorName);
  }

};

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-600">
          SECTORS — Last Updated: <span className='font-bold'> {formatTimestamp(sectors?.[0]?.timestamp) || ""} </span>
        </h4>
        {(selectedSector || selectedSectorGroup) && (
          <button
            onClick={onClear}
            className="text-xs bg-blue-100 px-2 py-1 rounded"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
        {sectors.map((sector) => (
          <div
            key={sector.sector}
         onClick={() => handleOnClick(sector.sector)}
            className={ `border rounded p-3 cursor-pointer hover:shadow
        ${selectedSector === sector.sector ? "border-blue-500 bg-blue-50 shadow-md" : ""}`  }
          >
            <div className="text-xs text-gray-500 uppercase">
              {sector.sector}
            </div>
           
           <div className={`font-bold ${sector.dayChange >= 0 ? "text-green-600" :  "text-red-600" }`}>
  {sector.dayChange > 0 ? "+" : ""} {sector.dayChange?.toFixed(2)}
</div>


          </div>
        ))}
      </div>
    </div>
  );
};

export default SectorSection;