import * as types from "../action-types";
const initState = {
  sidebarCollapsed: false,
  settingPanelVisible: false,
  excelData: [],
  queryFilters: {
    platform: [],
    department: [],
    departmentCategory: [],
    contentCategory: [],
    dateRange: null,
    keyword: ''
  }
};
export default function app(state = initState, action) {
  switch (action.type) {
    case types.APP_TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };
    case types.APP_TOGGLE_SETTINGPANEL:
      return {
        ...state,
        settingPanelVisible: !state.settingPanelVisible,
      };
    case types.EXCEL_SET_DATA:
      return {
        ...state,
        excelData: action.payload
      };
    case types.EXCEL_CLEAR_DATA:
      return {
        ...state,
        excelData: []
      };
    case types.EXCEL_SET_QUERY_FILTERS:
      return {
        ...state,
        queryFilters: action.payload
      };
    case types.EXCEL_CLEAR_QUERY_FILTERS:
      return {
        ...state,
        queryFilters: {
          platform: [],
          department: [],
          departmentCategory: [],
          contentCategory: [],
          dateRange: null,
          keyword: ''
        }
      };
    default:
      return state;
  }
}
