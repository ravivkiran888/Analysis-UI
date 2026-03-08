import { useEffect, useReducer } from "react";
import { ERROR, START, SUCCESS } from "../constants";


const initialState = {
  data: [],
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case START:
      return { ...state, loading: true, error: null };

    case SUCCESS:
      return { data: action.payload, loading: false, error: null };

    case ERROR:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

const fetchAll = async (dispatch) => {
  dispatch({ type: START });
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/signals/fetchAll`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch signals");
    }

    const data = await res.json();
    dispatch({ type: SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: ERROR, payload: err.message });
  }
};

export function useSignals() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    fetchAll(dispatch);
  }, []);

  return state;
}
