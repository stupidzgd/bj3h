import {
  FETCH_DICTIONARIES_REQUEST,
  FETCH_DICTIONARIES_SUCCESS,
  FETCH_DICTIONARIES_FAILURE,
  CLEAR_DICTIONARIES
} from '../actions/dictionary';

const initialState = {
  data: {
    platforms: [],
    contentCategories: [],
    departmentCategories: [],
    departments: []
  },
  loading: false,
  error: null
};

const dictionaryReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DICTIONARIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_DICTIONARIES_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null
      };
    case FETCH_DICTIONARIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case CLEAR_DICTIONARIES:
      return initialState;
    default:
      return state;
  }
};

export default dictionaryReducer;