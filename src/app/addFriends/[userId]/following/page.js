'use client'
import SelectedUserFollowingList from '@/components/UserFollowingList'
import React, { useEffect, useState } from 'react'

const Page = ({ params }) => {
  const [id, setId] = useState(null);

  useEffect(() => {
    setId(params.userId);
  }, [params.userId]);

  return (
    <div className='min-h-screen mb-20'>
      {id ? <SelectedUserFollowingList selectedUserId={id} /> : <div>Loading...</div>}
    </div>
  )
}

export default Page
