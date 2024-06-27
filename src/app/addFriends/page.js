
import AuthGuard2 from "@/components/LoggedOutAuthGaurad";
import UserList from "@/components/UserList";
import React from "react";


const AddFriends = () => {
   
  return (
    <AuthGuard2>
    <div>
      <UserList  />
    </div>
    </AuthGuard2>
  );
};

export default AddFriends;
