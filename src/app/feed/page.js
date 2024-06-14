import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { FollowProvider } from '../context/FollowContext';
import Feed from '../components/Feed';

const FeedPage = () => (
  <AuthProvider>
    <FollowProvider>
      <Feed />
    </FollowProvider>
  </AuthProvider>
);

export default FeedPage;
