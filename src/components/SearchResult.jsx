'use client'
import React from "react";

const SearchResult = ({ users, onUserClick }) => {
  return (
    <div className="absolute top-32 left-0 w-full h-[calc(100%-5rem)] bg-gray-800 bg-opacity-50 z-50">
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-0 w-full h-full overflow-auto bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Search Results</h2>
          <ul>
            {users.map(user => (
              <li key={user.id} className="cursor-pointer hover:bg-gray-100 p-2 rounded-lg flex items-center" onClick={() => onUserClick(user)}>
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full mr-4"
                />
                {user.firstName} {user.lastName}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
