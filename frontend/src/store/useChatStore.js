import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  typingUserId: null,

  unreadCounts: {},

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load users"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data.messages });

      // ✅ Mark messages as read in backend
      await axiosInstance.post(`/messages/mark-read/${userId}`);

    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load messages"
      );
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set({ messages: [...messages, res.data] });

    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(
        error?.response?.data?.message || "Failed to send message"
      );
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket?.on) return;

    socket.off("newMessage");
    socket.off("unreadCounts");

    // ✅ Listen for unread counts from backend polling every 1 sec
    socket.on("unreadCounts", (unreadCounts) => {
      set({ unreadCounts });
    });

    socket.on("newMessage", (newMessage) => {
      const otherUserId =
        newMessage.senderId === authUser?._id
          ? newMessage.receiverId
          : newMessage.senderId;
      const selectedUserId = get().selectedUser?._id;
      const isOpenChat = otherUserId === selectedUserId;

      if (isOpenChat) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }

      set((state) => {
        const existingUser = state.users.find(
          (user) => user._id === otherUserId
        );
        if (!existingUser) {
          return { users: state.users };
        }

        return {
          users: [existingUser, ...state.users.filter((u) => u._id !== otherUserId)],
        };
      });
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === get().selectedUser?._id) {
        set({ isTyping: true, typingUserId: senderId });
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === get().selectedUser?._id) {
        set({ isTyping: false, typingUserId: null });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket?.off) return;

    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
  },

  setSelectedUser: (selectedUser) =>
    set({ selectedUser }),
}));