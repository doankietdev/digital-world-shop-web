import clsx from 'clsx'

const inputClasses = ({ primary, outlined, rounded, hasError, className }) => {
  return clsx(
    {
      'border-[1px] hover:border-[2px] focus:border-[2px] bg-transparent placeholder:text-[#cacaca]':
        outlined,
      'text-black': !outlined
    },
    {
      'border-main text-main placeholder:text-dark-main':
        primary && outlined && !hasError
    },
    {
      'bg-main text-white placeholder:text-[#d4d4d4]':
        primary && !outlined && !hasError
    },
    {
      'rounded-lg': rounded
    },
    {
      // default input error
      'border border-red-500 hover:border-[2px] focus:border-[2px]':
        hasError
    },
    className,
    'w-full px-[15px] py-[10px] outline-none placeholder:capitalize'
  )
}

const errorMessageClasses = () => 'text-[12px] text-red-500'

export { inputClasses, errorMessageClasses }
