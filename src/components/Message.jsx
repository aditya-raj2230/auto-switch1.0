import React from "react";

const Message = ({ message, isOwnMessage }) => {
  const messageClasses = isOwnMessage
    ? " bg-orange-100 text-black self-end"
    : "bg-gray-200 text-gray-800 self-start";

  return (
    <div className="flex flex-col">
    <div className={`p-2 rounded-lg mb-2 max-w-xs break-words ${messageClasses}`}>
      <p>{message.text}</p>
      <span className="text-xs text-gray-500 mt-1 block">
        {new Date(message.timestamp?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
    </div>
  );
};

export default Message;
