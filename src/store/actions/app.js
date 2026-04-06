import * as types from "../action-types";
export const toggleSiderBar = () => {
  return {
    type: types.APP_TOGGLE_SIDEBAR
  };
};

export const toggleSettingPanel = () => {
  return {
    type: types.APP_TOGGLE_SETTINGPANEL
  };
};

export const setExcelData = (data) => {
  return {
    type: types.EXCEL_SET_DATA,
    payload: data
  };
};

export const clearExcelData = () => {
  return {
    type: types.EXCEL_CLEAR_DATA
  };
};

export const setQueryFilters = (filters) => {
  return {
    type: types.EXCEL_SET_QUERY_FILTERS,
    payload: filters
  };
};

export const clearQueryFilters = () => {
  return {
    type: types.EXCEL_CLEAR_QUERY_FILTERS
  };
};