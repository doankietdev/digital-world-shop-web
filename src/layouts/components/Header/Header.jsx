import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import logo from '~/assets/logo.png'
import noAvatarImage from '~/assets/no-avatar-image.png'
import { AvatarDropdown, DropdownDivider, DropdownItem } from '~/components'
import { routesConfig } from '~/config'
import { signOut } from '~/pages/Auth/AuthSlice'
import { dispatch } from '~/redux'
import { userSelector } from '~/redux/selectors'
import {
  FaCartShoppingIcon,
  FaPhoneAltIcon,
  FaUserIcon,
  IoMdMailIcon,
  IoMenuIcon
} from '~/utils/icons'
import NavBar from '../NavBar'
import { useState } from 'react'

function Header() {
  const [openExpandedNavBar, setOpenExpandedNavBar] = useState(false)
  const { current: user } = useSelector(userSelector)

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap()
    } catch (error) {
      toast.error(error.messages[0])
    }
  }

  const handleOpenExpandedNavBar = () => {
    setOpenExpandedNavBar((prev) => !prev)
  }

  return (
    <>
      <header className='sticky top-0 z-50'>
        <div className='relative z-50 container py-3 lg:py-4 flex justify-between items-center text-[13px] bg-white'>
          <div className='lg:hidden -ml-2'>
            <span onClick={handleOpenExpandedNavBar} className='p-2'>
              <IoMenuIcon className='icon !text-2xl md:lg:!text-4xl text-primary-400' />
            </span>
          </div>
          <Link to={routesConfig.home} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:translate-x-0 lg:translate-y-0 lg:static'>
            <img
              src={logo}
              alt='logo'
              className='h-[15px] md:h-[20px] lg:h-[28px] object-contain'
            />
          </Link>
          <div className='flex items-center gap-2 md:gap-4 lg:gap-10'>
            <div className='hidden lg:flex lg:flex-col lg:justify-center lg:items-center'>
              <span className='flex items-center gap-3'>
                <FaPhoneAltIcon className='icon text-primary-400' />
                <span className='font-semibold'>(+1800) 000 8808</span>
              </span>
              <span className='text-[12px]'>Mon-Sat 9:00AM - 8:00PM</span>
            </div>
            <div className='hidden lg:flex lg:flex-col lg:justify-center lg:items-center'>
              <span className='flex items-center gap-3'>
                <IoMdMailIcon className='icon text-primary-400' />
                <span className='font-semibold'>SUPPORT@TADATHEMES.COM</span>
              </span>
              <span className='text-[12px]'>Online Support 24/7</span>
            </div>
            <div className='p-2 relative'>
              <FaCartShoppingIcon className='icon text-primary-400' />
              <span className='absolute bottom-[calc(100%-20px)] left-[calc(100%-20px)] min-w-[26px] h-[22px] rounded-full flex justify-center items-center px-[6px] bg-primary-400 text-white border-2 border-white text-[10px]'>99+</span>
            </div>
            {user._id ? (
              <AvatarDropdown
                avatarSrc={user.image?.url || noAvatarImage}
                fullName={`${user.firstName} ${user.lastName}`}
                email={user.email}
              >
                <DropdownItem link={routesConfig.auth()}>
                  My Account
                </DropdownItem>
                <DropdownItem link={routesConfig.auth()}>
                  My Orders
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleSignOut}>Sign Out</DropdownItem>
              </AvatarDropdown>
            ) : (
              <Link
                to={routesConfig.auth()}
                className='flex items-center gap-2 p-2'
              >
                <FaUserIcon className='icon text-primary-400' />
                <span className='text-[14px]'>Sign In</span>
              </Link>
            )}
          </div>
        </div>
        <NavBar open={openExpandedNavBar} />
      </header>
    </>
  )
}

export default Header
