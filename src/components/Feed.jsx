
import { useAuth } from "../app/context/AuthContext"; // Import the AuthContext
import { useRouter } from "next/navigation";
import UserProfile from "@/components/Profile";
import PublicPosts from "./PublicPosts";

const Feed = () => {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.uid;

  return (
    <div>
      <UserProfile selectedUserId={userId} />
      <button ClassName="ml-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={() => router.push('/addFriends')}>Add Friends</button>
      {userId && (
        <button onClick={() => router.push('/createPost')} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">
          Create Post
        </button>
      )}
      {userId && (
        <button onClick={() => router.push('/chat')} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">
          Messages
        </button>
      )}
      <PublicPosts/>
    </div>
  );
};

export default Feed;
