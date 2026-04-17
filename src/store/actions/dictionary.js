import axios from '@/utils/request';

// Action types
export const FETCH_DICTIONARIES_REQUEST = 'FETCH_DICTIONARIES_REQUEST';
export const FETCH_DICTIONARIES_SUCCESS = 'FETCH_DICTIONARIES_SUCCESS';
export const FETCH_DICTIONARIES_FAILURE = 'FETCH_DICTIONARIES_FAILURE';
export const CLEAR_DICTIONARIES = 'CLEAR_DICTIONARIES';

// 获取所有字典数据
export const fetchDictionaries = () => async (dispatch) => {
  dispatch({ type: FETCH_DICTIONARIES_REQUEST });
  try {
    const response = await axios.get('/api/dictionaries/frontend');
    // 检查API响应是否成功，根据实际API返回格式调整
    if (response.data) {
      const data = response.data;
      dispatch({
        type: FETCH_DICTIONARIES_SUCCESS,
        payload: data
      });
    } else {
      dispatch({
        type: FETCH_DICTIONARIES_FAILURE,
        payload: '获取字典数据失败'
      });
    }
  } catch (error) {
    dispatch({
      type: FETCH_DICTIONARIES_FAILURE,
      payload: '获取字典数据失败'
    });
  }
};

// 清除字典数据
export const clearDictionaries = () => (dispatch) => {
  dispatch({ type: CLEAR_DICTIONARIES });
};