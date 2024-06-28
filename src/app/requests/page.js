'use client'
import RequestList from '@/components/RequestList'
import React from 'react'
import { useAuth } from '../context/AuthContext'

const page = () => {
    const {user} = useAuth()
    const userId= user.uid;
  return (
    <div>
      <RequestList userId={userId}/>
    </div>
  )
}

export default page
