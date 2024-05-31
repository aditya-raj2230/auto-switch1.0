import React from 'react'

const Button = ({type,title,icon,variant}) => {
  return (
   <button type={type} className={`flex flex-row justify-center gap-3 rounded-full ${variant} `}>
    {icon && <Image src={icon} alt={title} height={25} width={25} />}
    <label className='bold-16 whitespace-nowrap'>{title}</label>
   </button>
  )
}

export default Button
