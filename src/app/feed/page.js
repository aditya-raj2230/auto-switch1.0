import Feed from '@/components/Feed'
import React from 'react'
import { useAuth } from '../context/AuthContext'

const page = () => {

    const {user}= useAuth()

  return (
    
    <div>
      <Feed/>
    </div>
    
  )
}

export default page
