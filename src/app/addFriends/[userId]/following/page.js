'use client'
import SelectedUserFollowingList from '@/components/UserFollowingList'
import React, { useEffect, useState } from 'react'

const page = ({params}) => {

    const [id, setId] = useState()
  console.log(params)
 
  

  useEffect(() => {
    setId(params.userId)
  }, [params.userId])
  console.log(id)
  return (
    <div>
      <SelectedUserFollowingList selectedUserId={id}/>
    </div>
  )
}

export default page
