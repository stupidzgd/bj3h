import Cookies from 'js-cookie'

const TokenKey = 'Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  // 设置12小时过期时间
  return Cookies.set(TokenKey, token, { expires: 12 / 24 })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
