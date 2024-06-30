import AuthGuard from '@/components/AuthGaurd'
import EditForm from '@/components/EditForm'
import AuthGuard2 from '@/components/LoggedOutAuthGaurad'
import React from 'react'

const edit = () => {
  return (
    <AuthGuard2>
    <div className='min-h-screen mb-20'>
      <EditForm/>
    </div>
    </AuthGuard2>
  )
}

export default edit
