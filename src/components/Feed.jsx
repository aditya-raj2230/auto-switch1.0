

import {  useAuth } from "../app/context/AuthContext"; // Import the AuthContext
import { useRouter } from "next/navigation";


import UserProfile from "@/components/Profile";

const Feed = () => {
  const router = useRouter()
  const { user } = useAuth();
  const userId = user?.uid;

  return (
    <div>
      <UserProfile selectedUserId={userId} />
      <button onClick={()=>{router.push('/addFriends')}}>Add Friends</button>
    </div>
  );
};

export default Feed;
