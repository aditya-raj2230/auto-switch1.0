'use client'
import RequestList from '@/components/RequestList'
import React from 'react'
import { useAuth } from '../context/AuthContext'

const page = () => {
    const {user} = useAuth()
    const userId= user.uid;
  return (
    <div className='min-h-screen mb-20'>
      <RequestList userId={userId}/>
    </div>
  )
}

export default page
