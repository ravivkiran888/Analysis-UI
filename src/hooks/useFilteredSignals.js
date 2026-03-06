

import {BANK_SECTOR,NIFTYPSUBANK_SECTOR,NIFTYPVTBANK_SECTOR}  from "../constants";

import { useMemo } from "react";
import { sortData } from "../utils/sorting"


export function useFilteredSignals(
  stocksData,
  searchTerm,
  sectorSelected,
  selectedSectorGroup,
  sortConfig,
) {




  const processedData = useMemo(() => {
    let stocksFiltered = stocksData;

    if (searchTerm && searchTerm.trim() !== "") {
      const lowerCaseSearch = searchTerm.toLowerCase();

      stocksFiltered = stocksFiltered.filter((item) => {
        return item.symbol?.toLowerCase().includes(lowerCaseSearch);
      });
    }

    // STEP 3: Apply sector group filter (example: BANK group)
    if (selectedSectorGroup === BANK_SECTOR) {
      stocksFiltered = stocksFiltered.filter((item) => {
        return (
          item.sector === NIFTYPSUBANK_SECTOR ||
          item.sector === NIFTYPVTBANK_SECTOR
        );
      });
    }

    // STEP 4: Apply specific sector filter (if selected)
    else if (sectorSelected) {

      stocksFiltered = stocksFiltered.filter((item) => {
        return item.sector === sectorSelected;
      });
    }

    
    // STEP 5: Sort the final filtered result
    const sorted = sortData(stocksFiltered, sortConfig);

    return sorted;
  }, [stocksData, searchTerm, sectorSelected, selectedSectorGroup, sortConfig]);

  return processedData;
}
