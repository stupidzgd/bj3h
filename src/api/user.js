import request from '@/utils/request'

export function reqUserInfo(data) {
  return request({
    url: '/userInfo',
    method: 'post',
    data
  })
}

export function getUsers(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

export function deleteUser(data) {
  return request({
    url: '/user',
    method: 'delete',
    data
  })
}

export function editUser(data) {
  return request({
    url: '/user',
    method: 'put',
    data
  })
}

export function addUser(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

export function updateUserStatus(data) {
  return request({
    url: '/user/status',
    method: 'put',
    data
  })
}

export function resetPassword(data) {
  return request({
    url: '/user/reset-password',
    method: 'put',
    data
  })
}

export function updateProfile(data) {
  return request({
    url: '/updateProfile',
    method: 'post',
    data
  })
}

export function reqValidatUserID(data) {
  return request({
    url: '/user/validatUserID',
    method: 'post',
    data
  })
}

export function logout(data) {
  return request({
    url: '/logout',
    method: 'post',
    data
  })
}