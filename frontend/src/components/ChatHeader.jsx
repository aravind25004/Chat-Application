import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

// ✅ helper
const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "Offline";

  const now = new Date();
  const seenTime = new Date(lastSeen);

  const diffSeconds = (now - seenTime) / 1000;

  if (diffSeconds < 60) return "last seen just now";

  return `last seen at ${seenTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, isTyping, typingUserId } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>

            <p className="text-sm text-base-content/70">
              {isTyping && typingUserId === selectedUser._id
                ? "Typing..."
                : isOnline
                ? "Online"
                : formatLastSeen(selectedUser.lastSeen)}
            </p>
          </div>
        </div>

        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;