import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import noImage from '~/assets/no-image.png'
import {
  Button,
  Card,
  Checkbox,
  DocumentTitle,
  QuantityField
} from '~/components'
import { dispatch } from '~/redux'
import { cartSelector } from '~/redux/selectors'
import { formatCash, parsePlaceHolderUrl } from '~/utils/formatter'
import {
  deleteFromCart,
  updateProductQuantity,
  updateVariant
} from './CartSlice'
import UpdateVariant from './UpdateVariant'
import { Link } from 'react-router-dom'
import { routesConfig } from '~/config'
import { DeleteIcon } from '~/utils/icons'
import { FaHeart } from 'react-icons/fa'
import { reviewOrder } from '~/services/checkoutService'

const TIME_UPDATE_QUANTITY = 700 // ms

function Cart() {
  const updateVariantRef = useRef()
  const { products } = useSelector(cartSelector)
  const timer = useRef(null)
  const oldestQuantity = useRef(null)
  const [disabled, setDisabled] = useState(false)
  const [orderProducts, setOrderProducts] = useState([])
  const [paymentInfo, setPaymentInfo] = useState({
    totalPriceApplyDiscount: 0,
    totalPrice: 0,
    countProducts: 0
  })

  const navigate = useNavigate()

  // process payment info when click check box product
  useEffect(() => {
    const fetchApi = async () => {
      let toastId = null
      try {
        if (!orderProducts.length) return
        toastId = toast.loading('Processing payment information')
        const {
          totalPriceApplyDiscount,
          totalPrice,
          orderProducts: responseOrderProducts
        } = await reviewOrder(orderProducts)
        setPaymentInfo((prevPaymentInfo) => ({
          ...prevPaymentInfo,
          totalPriceApplyDiscount,
          totalPrice,
          countProducts: responseOrderProducts.length
        }))
      } catch (error) {
        toast.update(toastId, {
          render: error.messages[0],
          type: 'error',
          isLoading: false
        })
      } finally {
        toast.dismiss(toastId)
      }
    }
    fetchApi()
  }, [orderProducts])

  // set paymentInfo back default value when orderProduct is empty
  useEffect(() => {
    if (orderProducts.length === 0) {
      setPaymentInfo({
        totalPriceApplyDiscount: 0,
        totalPrice: 0,
        countProducts: 0
      })
    }
  }, [orderProducts.length])

  const handleQuantityFieldChange = useCallback(
    ({ productId, variantId, quantity, oldQuantity }) => {
      if (!quantity) return

      if (timer.current) {
        clearTimeout(timer.current)
        if (!quantity) return
      }
      if (!oldestQuantity.current) {
        oldestQuantity.current = oldQuantity
      }

      timer.current = setTimeout(async () => {
        toast.promise(
          dispatch(
            updateProductQuantity({
              productId,
              variantId,
              quantity,
              oldQuantity: oldestQuantity.current
            })
          ).unwrap(),
          {
            pending: {
              render() {
                setDisabled(true)
                oldestQuantity.current = null
                return 'Updating product quantity'
              }
            },
            success: {
              render() {
                setDisabled(false)
                return 'Update product quantity successfully'
              }
            },
            error: {
              render({ data }) {
                setDisabled(false)
                return data.messages[0]
              }
            }
          }
        )
      }, TIME_UPDATE_QUANTITY)
    },
    []
  )

  const handleUpdateVariant = useCallback(
    ({ productId, oldVariantId, variantId }) => {
      toast.promise(
        dispatch(
          updateVariant({ productId, oldVariantId, variantId })
        ).unwrap(),
        {
          pending: {
            render() {
              setDisabled(true)
              return 'Updating variant'
            }
          },
          success: {
            render() {
              setDisabled(false)
              return 'Update variant successfully'
            }
          },
          error: {
            render({ data }) {
              setDisabled(false)
              updateVariantRef.current.rollback()
              return data.messages[0]
            }
          }
        }
      )
    },
    []
  )

  const handleDeleteProductFromCart = useCallback(
    ({ productId, variantId }) => {
      toast.promise(
        dispatch(deleteFromCart([{ productId, variantId }])).unwrap(),
        {
          pending: {
            render() {
              setDisabled(true)
              return 'Deleting product from cart'
            }
          },
          success: {
            render() {
              setDisabled(false)
              return 'Delete product from cart successfully'
            }
          },
          error: {
            render({ data }) {
              setDisabled(false)
              updateVariantRef.current.rollback()
              return data.messages[0]
            }
          }
        }
      )
    },
    []
  )

  const handleItemCheckBoxClick = useCallback(
    ({ productId, variantId, oldPrice, price, quantity, checked }) => {
      setOrderProducts((prevOrderProducts) => {
        if (checked)
          return [
            ...prevOrderProducts,
            { productId, variantId, oldPrice, price, quantity }
          ]
        return prevOrderProducts.filter(
          (orderProduct) =>
            orderProduct.productId !== productId ||
            orderProduct.variantId !== variantId
        )
      })
    },
    []
  )

  const handleSelectAllCheckBoxClick = useCallback(
    ({ checked }) => {
      if (checked) {
        setOrderProducts(
          products.map(({ variantId, quantity, product }) => ({
            productId: product?._id,
            variantId,
            oldPrice: product.oldPrice,
            price: product.price,
            quantity
          }))
        )
        return
      }
      setOrderProducts([])
    },
    [products]
  )

  const handleDeleteSelectedProducts = useCallback(() => {
    toast.promise(
      dispatch(
        deleteFromCart(
          orderProducts.map(({ productId, variantId }) => ({
            productId,
            variantId
          }))
        )
      ).unwrap(),
      {
        pending: {
          render() {
            setDisabled(true)
            return 'Deleting selected products from cart'
          }
        },
        success: {
          render() {
            setDisabled(false)
            setOrderProducts([])
            return 'Delete selected products from cart successfully'
          }
        },
        error: {
          render({ data }) {
            setDisabled(false)
            updateVariantRef.current.rollback()
            return data.messages[0]
          }
        }
      }
    )
  }, [orderProducts])

  const handleBuyClick = useCallback(() => {
    const orderProductsString = encodeURIComponent(JSON.stringify(orderProducts))
    navigate(`${routesConfig.checkout}?state=${orderProductsString}`)
  }, [navigate, orderProducts])

  return (
    <>
      <DocumentTitle title="Cart" />
      <div className="container">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3 shadow-card-md">
            <div className="flex items-center gap-1 font-semibold">
              <div className="mr-4">
                <Checkbox
                  checked={
                    orderProducts.length === products.length &&
                    products.length > 0
                  }
                  disabled={products.length === 0}
                  onChange={(e) =>
                    handleSelectAllCheckBoxClick({ checked: e.target.checked })
                  }
                />
              </div>
              <div className="basis-4/12 text-[14px]">Product</div>
              <div className="basis-2/12 text-[14px] text-center">Variant</div>
              <div className="basis-[12.5%] text-[14px] text-center">
                Unit Price
              </div>
              <div className="basis-[12.5%] text-[14px] text-center">
                Quantity
              </div>
              <div className="basis-[12.5%] text-[14px] text-center">
                Total Price
              </div>
              <div className="basis-[12.5%] text-[14px] text-center">
                Action
              </div>
            </div>
          </Card>

          {products.map(({ product, variantId, quantity }, index) => {
            const variant = product?.variants?.find(
              (variant) => variant._id === variantId
            )
            return (
              <Card
                key={index}
                className="flex flex-col gap-3 overflow-visible"
              >
                <div className="flex items-center gap-1">
                  <div className="mr-4">
                    <Checkbox
                      id="checkbox"
                      checked={
                        !!orderProducts.find(
                          (orderProduct) =>
                            orderProduct.productId === product?._id &&
                            orderProduct.variantId === variantId
                        )
                      }
                      onChange={(e) => {
                        handleItemCheckBoxClick({
                          productId: product?._id,
                          variantId,
                          oldPrice: product.oldPrice,
                          price: product.price,
                          quantity,
                          checked: e.target.checked
                        })
                      }}
                    />
                  </div>
                  <div className="basis-4/12 text-[14px] flex items-center gap-3">
                    <Link
                      to={parsePlaceHolderUrl(routesConfig.productDetails, {
                        slug: product?.slug
                      })}
                    >
                      <img
                        src={variant?.images[0] || noImage}
                        className="w-[80px] h-[80px] object-contain"
                      />
                    </Link>
                    <Link
                      to={parsePlaceHolderUrl(routesConfig.productDetails, {
                        slug: product?.slug
                      })}
                    >
                      <p className="text-[14px] line-clamp-2 hover:text-primary-400 transition-all duration-300 ease-in-out">
                        {product?.title}
                      </p>
                    </Link>
                  </div>
                  <div className="basis-2/12 text-[14px] flex justify-center items-center">
                    <UpdateVariant
                      title={variant?.name}
                      variants={product?.variants}
                      defaultVariantId={variant?._id}
                      onChange={(value) =>
                        handleUpdateVariant({
                          productId: product?._id,
                          oldVariantId: variant?._id,
                          variantId: value
                        })
                      }
                      disabled={disabled}
                      ref={updateVariantRef}
                    />
                  </div>
                  <div className="basis-[12.5%] text-[14px] text-center">
                    {product?.oldPrice && (
                      <p className="text-[14px] text-gray-500 line-through">
                        {formatCash(product?.oldPrice)}
                      </p>
                    )}
                    <p className="text-[14px]">{formatCash(product?.price)}</p>
                  </div>
                  <div className="basis-[12.5%] text-[14px] flex justify-center items-center">
                    <QuantityField
                      defaultValue={quantity}
                      max={variant ? variant?.quantity : product?.quantity}
                      disabled={disabled}
                      onChange={({ quantity, oldQuantity }) =>
                        handleQuantityFieldChange({
                          productId: product._id,
                          variantId: variant._id,
                          quantity,
                          oldQuantity
                        })
                      }
                    />
                  </div>
                  <div className="basis-[12.5%] text-[14px] flex justify-center items-center text-primary-400">
                    {formatCash(product?.price * quantity)}
                  </div>
                  <div className="basis-[12.5%] text-[14px] flex justify-center items-center">
                    <button
                      title="Delete"
                      className="hover:text-primary-400 transition-all duration-200 ease-in-out"
                      onClick={() =>
                        handleDeleteProductFromCart({
                          productId: product?._id,
                          variantId
                        })
                      }
                    >
                      <DeleteIcon className="text-[22px]" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}

          <Card className="flex justify-between shadow-card-md sticky bottom-0 bg-white">
            <div className="flex gap-5">
              <div className="flex items-center gap-1">
                <Checkbox
                  id="selectAll"
                  checked={
                    orderProducts.length === products.length &&
                    products.length > 0
                  }
                  disabled={products.length === 0}
                  onChange={(e) =>
                    handleSelectAllCheckBoxClick({ checked: e.target.checked })
                  }
                />
                <label
                  htmlFor="selectAll"
                  className="select-none cursor-pointer hover:text-primary-400 transition-all duration-200 ease-in-out"
                >
                  Select All
                </label>
              </div>

              <button
                className="flex items-center gap-1 hover:text-primary-400 transition-all duration-200 ease-in-out"
                onClick={handleDeleteSelectedProducts}
              >
                <DeleteIcon className="text-[22px]" />
                Delete
              </button>

              <button className="flex items-center gap-1 hover:text-primary-400 transition-all duration-200 ease-in-out">
                <FaHeart className="text-[18px]" />
                Add to wishlist
              </button>
            </div>
            <div className="flex gap-7 items-center">
              <div>
                <div className="flex items-center justify-center gap-2">
                  <span>
                    Total payment ({paymentInfo.countProducts} products):
                  </span>
                  <span className="text-[24px] text-primary-400">
                    {formatCash(paymentInfo.totalPriceApplyDiscount)}
                  </span>
                </div>
                {paymentInfo.totalPrice - paymentInfo.totalPriceApplyDiscount >
                  0 && (
                  <div className="text-[14px] flex items-center justify-end gap-4">
                    <span>Savings</span>
                    <span className="text-primary-400">
                      {formatCash(
                        paymentInfo.totalPrice -
                          paymentInfo.totalPriceApplyDiscount
                      )}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Button
                  primary
                  rounded
                  disabled={!orderProducts.length}
                  onClick={handleBuyClick}
                >
                  Buy
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Cart