import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    unreadCounts,
    isTyping,
    typingUserId
  } = useChatStore();

  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  const formatTime = (date) => {
    if (!date) return "";

    const msgDate = new Date(date);
    const now = new Date();

    if (msgDate.toDateString() === now.toDateString()) {
      return msgDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (msgDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return msgDate.toLocaleDateString();
  };

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">

      {/* HEADER */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>

          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      {/* USERS */}
      <div className="overflow-y-auto w-full py-2">
        {filteredUsers.map((user) => {
          const unread = unreadCounts?.[user._id] || 0;
          const isSelected = selectedUser?._id === user._id;
          const isUserTyping = isTyping && typingUserId === user._id;

          const isMyMessage =
            user.lastMessageSenderId === authUser?._id;

          const firstName = user.fullName.split(" ")[0];

          const messageText = isUserTyping
            ? "Typing..."
            : user.lastMessage
            ? `${isMyMessage ? "Me" : firstName}: ${user.lastMessage}`
            : "Start chatting";

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full px-3 py-3 flex items-center gap-3 hover:bg-base-300 transition ${
                isSelected ? "bg-base-300" : ""
              }`}
            >
              {/* AVATAR */}
              <div className="relative">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 rounded-full"
                />

                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}

                {unread > 0 && !isSelected && (
                  <span className="absolute top-0 right-0 min-w-[18px] h-[18px] text-[10px] bg-green-500 text-black font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>

              {/* TEXT */}
              <div className="hidden lg:flex flex-col flex-1 min-w-0">

                {/* NAME */}
                <div className="flex justify-between items-start">
                  <span className="font-medium truncate">
                    {user.fullName}
                  </span>
                </div>

                {/* MESSAGE + TIME */}
                <div className="flex justify-between items-center mt-1">

                  <p
                    className={`text-sm truncate ${
                      unread > 0
                        ? "font-semibold text-base-content"
                        : "text-zinc-400"
                    }`}
                  >
                    {messageText}
                  </p>

                  <span className="text-xs text-zinc-400 ml-3 shrink-0">
                    {formatTime(user.lastMessageTime)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;