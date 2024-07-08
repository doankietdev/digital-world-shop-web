import { getCurrentUserApi, setDefaultAddressApi, updateCurrentUserApi, uploadAvatarApi } from '~/apis/userApis'
import axiosClient from '~/config/axiosClient'
import UIError from '~/utils/UIError'

const getCurrentUser = async (params) => {
  try {
    const { metadata } = await axiosClient.get(getCurrentUserApi, {
      params
    })
    return metadata.user
  } catch (error) {
    return Promise.reject(new UIError(['Something went wrong']))
  }
}

const setDefaultAddress = async (addressId) => {
  try {
    const { metadata } = await axiosClient.post(setDefaultAddressApi, {
      addressId
    })
    return metadata
  } catch (error) {
    return Promise.reject(new UIError(['Something went wrong']))
  }
}

const uploadAvatar = async (formData) => {
  try {
    const { metadata } = await axiosClient.patch(uploadAvatarApi, formData)
    return metadata.user
  } catch (error) {
    return Promise.reject(new UIError(['Something went wrong']))
  }
}

const updateCurrentUser = async (data = {}) => {
  try {
    const { metadata } = await axiosClient.patch(updateCurrentUserApi, data)
    return metadata.user
  } catch (error) {
    return Promise.reject(new UIError(['Something went wrong']))
  }
}

export default {
  getCurrentUser,
  setDefaultAddress,
  uploadAvatar,
  updateCurrentUser
}
