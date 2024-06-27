import { capturePayPalOrderApi, createPayPalOrderApi } from '~/apis/paymentApis'
import axiosClient from '~/config/axiosClient'
import UIError from '~/utils/UIError'

const createPayPalOrder = async (orderProducts) => {
  try {
    const { metadata } = await axiosClient.post(createPayPalOrderApi, {
      orderProducts
    })
    return metadata
  } catch (error) {
    return Promise.reject(new UIError(['Something went wrong']))
  }
}

const capturePayPalOrder = async ({ paypalOrderId, orderProducts }) => {
  try {
    const { metadata } = await axiosClient.post(capturePayPalOrderApi, {
      paypalOrderId,
      orderProducts
    })
    return metadata
  } catch (error) {
    return Promise.reject(new UIError(['Something went wrong']))
  }
}

export default {
  createPayPalOrder,
  capturePayPalOrder
}