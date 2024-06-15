'use client'
// pages/profile/[userId].js
import SelectedUserProfile from '@/components/selectedUserProfile'
import React, { useEffect, useState } from 'react'


// to generate potential dynamic route


export default function Page ({params}){
  // const router = useRouter()
  const [id, setId] = useState()
  console.log(params)
 
  

  useEffect(() => {
    setId(params.userId)
  }, [params.userId])

  return (
    <div>

      <SelectedUserProfile selectedUserId={id} />
    </div>
  )
}

