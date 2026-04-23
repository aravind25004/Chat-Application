import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isTyping,
    typingUserId
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const formatDateLabel = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) return "Today";
    if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";

    return msgDate.toLocaleDateString();
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isMe = message.senderId === authUser._id;

          const nextMessage = messages[index + 1];
          const isLastInGroup =
            !nextMessage || nextMessage.senderId !== message.senderId;

          const showDate =
            index === 0 ||
            new Date(messages[index - 1].createdAt).toDateString() !==
              new Date(message.createdAt).toDateString();

          return (
            <div key={message._id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="text-xs bg-base-300 px-3 py-1 rounded-full opacity-60">
                    {formatDateLabel(message.createdAt)}
                  </span>
                </div>
              )}

              <div className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                
                {isLastInGroup ? (
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border">
                      <img
                        src={
                          isMe
                            ? authUser.profilePic || "/avatar.png"
                            : selectedUser.profilePic || "/avatar.png"
                        }
                        alt="profile pic"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-10" />
                )}

                <div className="chat-bubble flex flex-col relative">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}

                  {message.text && <p className="pr-10">{message.text}</p>}

                  <span className="absolute bottom-1 right-2 text-[10px] opacity-70">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* typing bubble */}
        {isTyping && typingUserId === selectedUser?._id && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="typing user"
                />
              </div>
            </div>

            <div className="chat-bubble flex items-center gap-1 px-4 py-2">
              <span className="w-2 h-2 bg-current opacity-70 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;