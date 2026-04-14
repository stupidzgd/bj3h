import * as types from "../action-types";
import { reqUserInfo, logout } from "@/api/user";
import { removeToken } from "@/utils/auth";

export const getUserInfo = (token) => (dispatch) => {
  return new Promise((resolve, reject) => {
    reqUserInfo({ token })
      .then((data) => {
        if (data.status === 0) {
          const userInfo = data.userInfo;
          dispatch(setUserInfo(userInfo));
          resolve(data);
        } else {
          const msg = data.message;
          reject(msg);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const setUserToken = (token) => {
  return {
    type: types.USER_SET_USER_TOKEN,
    token,
  };
};

export const setUserInfo = (userInfo) => {
  return {
    type: types.USER_SET_USER_INFO,
    ...userInfo,
  };
};

export const resetUser = () => {
  return {
    type: types.USER_RESET_USER,
  };
};

export const userLogout = (token) => (dispatch) => {
  return new Promise((resolve, reject) => {
    // 直接清除前端状态和token，不请求后端接口
    dispatch(resetUser());
    removeToken();
    resolve({ status: 0, message: '注销成功' });
  });
};
