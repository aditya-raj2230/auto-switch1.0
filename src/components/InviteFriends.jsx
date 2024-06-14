import React from 'react';

const InviteFriend = ({ onCopy, onClose, isGray }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-30">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="mb-4">Share this URL with friends:</p>
        <input type="text" id="urlInput" value="https://auto-switch1-0.vercel.app" readOnly className="border p-2 mb-4 w-full" />
        <div className="flex justify-end">
          <button className={`px-4 py-2 bg-green-600 text-white rounded-lg mr-2 hover:bg-green-800 ${isGray ? "bg-gray-600 hover:bg-gray-800" : ""}`} onClick={onCopy}>
            Copy
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriend;
