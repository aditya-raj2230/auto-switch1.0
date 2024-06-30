'use client'
import SelectedUserFollowersList from '@/components/UserFollowersList'
import React, { useEffect, useState } from 'react'

const page = ({params}) => {
    const [id, setId] = useState()
  console.log(params)
 
  

  useEffect(() => {
    setId(params.userId)
  }, [params.userId])
  console.log(id)
  return (
    <div className='min-h-screen mb-20'>
      <SelectedUserFollowersList selectedUserId={id}/>
    </div>
  )
}

export default page
