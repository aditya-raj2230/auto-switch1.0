import React from 'react';
import VehicleList from './VehicleList';

const UserProfile = ({ userData, profileImageUrl, bannerImageUrl, selectedUserId, handleFollow, handleEdit, followingList }) => {
  return (
    <div className="max-w-5xl mx-auto my-10 p-0 pb-10 pt-0 bg-white rounded-lg shadow-lg relative">
      <div className="text-center">
        {bannerImageUrl ? (
          <img src={bannerImageUrl} alt="Banner" className="w-full h-72 object-cover mb-6 sm:mb-10" />
        ) : (
          <div className="w-full h-72 bg-gray-200 mb-6 sm:mb-10"></div>
        )}

        {profileImageUrl ? (
          <img src={profileImageUrl} alt="Profile" className="w-56 h-56 sm:w-72 sm:h-72 lg:absolute lg:ml-32 lg:mr-32 rounded-lg border-8 md:rounded-full border-white shadow-lg inline-block mb-4 absolute top-28 sm:top-40 right-1/2 sm:right-2/3 transform translate-x-1/2" />
        ) : (
          <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-lg bg-gray-300 flex items-center justify-center text-gray-500 text-3xl md:rounded-full border-8 border-white shadow-lg mb-4 absolute top-28 sm:top-40 right-1/2 sm:right-2/3 transform translate-x-1/2">
            <span>+</span>
          </div>
        )}

        <h1 className="text-3xl font-bold mt-20 md:m-2 text-gray-900">
          {userData.firstName.toUpperCase()} {userData.lastName.toUpperCase()}
        </h1>
        <p className="text-lg text-gray-600">{userData.bio}</p>

        <div className="flex justify-center space-x-8 my-6">
          <div>
            <p className="text-gray-900 font-bold text-xl">{userData.followerCount}</p>
            <p className="text-gray-600 text-xl">Followers</p>
          </div>
          <div>
            <p className="text-gray-900 font-bold text-xl">{userData.followingCount}</p>
            <p className="text-gray-600 text-xl">Following</p>
          </div>
        </div>

        <div className="m-2">
          <strong>Joined:</strong> {new Date(userData.createdAt.seconds * 1000).toLocaleDateString()}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <div></div>
        {userData.userId !== selectedUserId && (
          <div className="flex items-center flex-col">
            <button className={`bg-indigo-600 text-white px-6 m-2 py-2 rounded-lg hover:bg-indigo-800 ${followingList.includes(selectedUserId) ? "bg-gray-600 hover:bg-gray-800" : ""}`} onClick={() => handleFollow(selectedUserId)}>
              {followingList.includes(selectedUserId) ? "Unfollow" : "Follow"}
            </button>
            <p className="m-2">{userData.carSwappingInterest ? "Interested in Swapping" : "Not interested in Swapping"}</p>
          </div>
        )}

        {userData.userId === selectedUserId && (
          <button className="bg-indigo-600 text-white px-6 py-2 m-2 rounded-lg hover:bg-indigo-800" onClick={handleEdit}>
            Finish Profile
          </button>
        )}
      </div>

      <div className="container flex flex-col items-center mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">User Vehicles</h1>
        <VehicleList userId={selectedUserId} />
      </div>
    </div>
  );
};

export default UserProfile;
