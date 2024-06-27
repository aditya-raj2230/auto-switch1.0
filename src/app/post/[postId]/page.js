'use client'
import { useRouter } from 'next/navigation';
import PostDetails from '../../../components/PostDetails';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import AuthGuard2 from '@/components/LoggedOutAuthGaurad';

const PostPage = ({params}) => {
  const router = useRouter();
  const {user} = useAuth()
  
  const [postid, setPostid] = useState()
  console.log(params)
 
  

  useEffect(() => {
    setPostid(params.postId)
  }, [params.postId])

  return (<AuthGuard2><PostDetails postid={postid} currentUser={user}/></AuthGuard2>);
};

export default PostPage;