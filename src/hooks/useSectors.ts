import { useEffect, useReducer } from "react";
import { SectorApiResponse } from "../types/SectorApiResponse";

type State = {
  data: SectorApiResponse[];
  loading: boolean;
  error: string | null;
};

const initialState: State = {
  data: [],
  loading: true,
  error: null,
};

function reducer(state: State, action: any): State {
  switch (action.type) {
    case "START":
      return { ...state, loading: true, error: null };

    case "SUCCESS":
      return { data: action.payload, loading: false, error: null };

    case "ERROR":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

export function useSectors(): State {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "START" });

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/signals/sectors`
        );

        if (!res.ok) throw new Error("Failed to fetch sectors");

        const data: SectorApiResponse[] = await res.json();
        dispatch({ type: "SUCCESS", payload: data });
      } catch (err: any) {
        dispatch({ type: "ERROR", payload: err.message });
      }
    };

    fetchData();
  }, []);

  return state;
}