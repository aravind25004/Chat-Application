import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiRef = useRef(null);
  const emojiBtnRef = useRef(null);

  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  const typingTimeoutRef = useRef(null);

  const emojis = [
    "😀","😂","😍","😎","😭","👍","🔥","❤️","🙏","🎉",
    "🖕","✌️","🤚","🤜","🤛","👊","🤝","😓","😅"
  ];

  // ✅ CLICK OUTSIDE CLOSE EMOJI
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(e.target) &&
        !emojiBtnRef.current.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ AUTO RESIZE TEXTAREA
  const handleResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  // ✅ FILE SELECT IMAGE
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ✅🔥 NEW: PASTE IMAGE SUPPORT
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;

      for (let item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();

          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(file);

          e.preventDefault(); // stop text paste
          break;
        }
      }
    };

    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.addEventListener("paste", handlePaste);
    return () => textarea.removeEventListener("paste", handlePaste);
  }, []);

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      if (socket && selectedUser) {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }

      setText("");
      setImagePreview(null);
      setShowEmoji(false);

      if (textareaRef.current) textareaRef.current.style.height = "auto";
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-3 w-full relative">

      {/* IMAGE PREVIEW */}
      {imagePreview && (
        <div className="mb-2">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              className="w-20 h-20 rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1 -right-1 w-5 h-5 bg-base-300 rounded-full flex items-center justify-center"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* EMOJI PICKER */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="absolute bottom-16 right-16 bg-base-200 p-3 rounded-xl shadow-xl z-50 w-64"
        >
          <div className="grid grid-cols-6 gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => {
                  setText((prev) => prev + emoji);
                  textareaRef.current?.focus();
                }}
                className="text-lg hover:scale-125 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT */}
      <form onSubmit={handleSendMessage}>
        <div className="flex items-end bg-base-200 rounded-2xl px-3 py-2 gap-2">

          {/* TEXTAREA */}
          <textarea
            ref={textareaRef}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm max-h-32 overflow-y-auto"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleResize();

              if (!socket || !selectedUser) return;

              socket.emit("typing", { receiverId: selectedUser._id });

              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }

              typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stopTyping", {
                  receiverId: selectedUser._id,
                });
              }, 1000);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />

          {/* EMOJI BUTTON */}
          <button
            ref={emojiBtnRef}
            type="button"
            onClick={() => setShowEmoji((prev) => !prev)}
            className="text-zinc-400 hover:text-white"
          >
            <Smile size={22} />
          </button>

          {/* IMAGE BUTTON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-zinc-400 hover:text-white"
          >
            <Image size={22} />
          </button>

          {/* SEND */}
          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="text-zinc-400 hover:text-white"
          >
            <Send size={22} />
          </button>

          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </form>
    </div>
  );
};

export default MessageInput;