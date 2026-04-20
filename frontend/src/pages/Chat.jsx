import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
  UserPlus,
  Image as ImageIcon,
  Mic,
  Check,
  CheckCheck,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Download,
  X,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { io } from "socket.io-client";
import { cn } from "@/src/lib/utils";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";
import { useTheme } from "@/src/context/ThemeContext";
import { messageService } from "@/src/services/messageService";

const SOCKET_URL = window.location.origin;

export default function Chat() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const [contacts, setContacts] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchContacts();

    // Initialize Socket.io
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      console.log("Connected to websocket");
      if (user?._id) {
        socketRef.current.emit("join_room", user._id);
      }
    });

    socketRef.current.on("receive_message", (newMessage) => {
      // Check if the message belongs to the active chat
      if (
        (newMessage.sender === activeChatId || newMessage.sender._id === activeChatId) ||
        newMessage.messageType === "system"
      ) {
        const mappedMsg = {
          ...newMessage,
          id: newMessage._id,
          text: newMessage.content,
          own: newMessage.sender === user?._id || newMessage.sender._id === user?._id,
          time: new Date(newMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "sent",
        };
        setChatMessages((prev) => [...prev, mappedMsg]);
      }
      
      // Update contacts list last message
      fetchContacts();
    });

    socketRef.current.on("message_deleted", (messageId) => {
      setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, activeChatId]);

  const isUserOnline = (lastActive) => {
    if (!lastActive) return false;
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return new Date() - new Date(lastActive) < threeDays;
  };

  const fetchContacts = async () => {
    try {
      const data = await messageService.getContacts();
      const mapped = data.map((c) => ({
        ...c,
        id: c._id,
        online: isUserOnline(c.lastActive),
        avatar: c.name ? c.name[0] : "?",
        color: "bg-indigo-500/20",
        lastMsg: isUserOnline(c.lastActive) ? "Connected" : "Offline",
        time: "",
      }));
      setContacts(mapped);
      // Auto-select first contact if none selected
      if (mapped.length > 0 && !activeChatId) {
        setActiveChatId(mapped[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const data = await messageService.getMessages(contactId);
      const mapped = data.map((m) => ({
        ...m,
        id: m._id,
        text: m.content,
        own: m.sender === user?._id || m.sender._id === user?._id,
        time: new Date(m.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: m.isRead ? "read" : "sent",
      }));

      setChatMessages(mapped);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const isActiveSwap = (status) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s === "accepted" || s === "ongoing" || s === "occupied";
  };

  const isGlobalBusy = contacts.some(c => isActiveSwap(c.swapStatus) && c.id !== activeChatId);

  const handleJoinRoom = async () => {
    if (!isActiveSwap(activeChat?.swapStatus) || isGlobalBusy) {
      if (isGlobalBusy) alert("You are already in an ongoing swap with someone else.");
      else alert("This session has ended or is not yet active.");
      return;
    }
    
    // Consistent room ID regardless of who initiates
    const ids = [user?._id, activeChatId].sort();
    const consistentRoomId = ids.join("-");
    
    const videoUrl = `/video/index.html?room=${consistentRoomId}&name=${encodeURIComponent(user?.name || "Participant")}`;
    
    try {
      const data = await messageService.sendMessage({
        receiver: activeChatId,
        content: `join-video-call`,
        messageType: "video_call",
      });

      const newMessage = {
        ...data,
        id: data._id,
        text: data.content,
        own: true,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      };

      setChatMessages((prev) => [...prev, newMessage]);
      socketRef.current.emit("send_message", data);
    } catch (err) {
      console.error("Failed to send video call message:", err);
    }

    window.open(videoUrl, "_blank");
  };

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !activeChatId) return;

    try {
      const data = await messageService.sendMessage({
        receiver: activeChatId,
        content: message,
        messageType: "text",
      });

      const newMessage = {
        ...data,
        id: data._id,
        text: data.content,
        own: true,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      };

      setChatMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // Emit through socket
      socketRef.current.emit("send_message", data);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChatId) return;

    setIsUploading(true);
    try {
      const uploadRes = await messageService.uploadFile(file);
      const data = await messageService.sendMessage({
        receiver: activeChatId,
        content: uploadRes.messageType === "image" ? "Sent an image" : `Sent a document: ${uploadRes.fileName}`,
        messageType: uploadRes.messageType,
        fileUrl: uploadRes.fileUrl,
        fileName: uploadRes.fileName
      });

      const newMessage = {
        ...data,
        id: data._id,
        text: data.content,
        own: true,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      };

      setChatMessages((prev) => [...prev, newMessage]);
      socketRef.current.emit("send_message", data);
    } catch (err) {
      console.error("Failed to upload file:", err);
      alert(err.message || "Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (deleteMessageId) {
      console.log("Deleting message with ID:", deleteMessageId);
      try {
        await messageService.deleteMessage(deleteMessageId);
        
        // Notify the other user via socket
        if (socketRef.current && activeChatId) {
          socketRef.current.emit("delete_message", {
            messageId: deleteMessageId,
            receiver: activeChatId
          });
        }

        setChatMessages((prev) => prev.filter((m) => m.id !== deleteMessageId));
        setDeleteMessageId(null);
      } catch (err) {
        console.error("Failed to delete message:", err);
        alert(`Failed to delete message: ${err.message}`);
      }
    }
  };

  const activeChat = contacts.find((c) => c.id === activeChatId) || {};

  const filteredChats = contacts.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatId, chatMessages]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const menuPopupRef = useRef(null);

  const emojis = [
    { category: "Smileys", items: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈"] },
    { category: "Gestures", items: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "💪", "🧠", "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋", "🩸"] },
    { category: "Hearts", items: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"] },
    { category: "Animals", items: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", " monkey", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔", "🐾", "🐉", "🐲", "🌵", "🎄", "🌲", "🌳", "🌴", "🌱", "🌿", "☘️", "🍀", "🎍", "🪴", "🎋", "🍃", "🍂", "🍁", "🍄", "🐚", "🌾", "💐", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼", "🌻", "🌞", "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌎", "🌍", "🌏", "🪐", "💫", "⭐️", "🌟", "✨", "⚡️", "☄️", "💥", "🔥", "🌪️", "🌈", "☀️", "🌤️", "⛅️", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "❄️", "☃️", "⛄️", "🌬️", "💨", "💧", "💦", "☔️", "☂️", "🌊", "🌫️"] },
    { category: "Food", items: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🥣", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🍢", "🍳", "🍱", "🍮", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🧁", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "☕️", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🧊", "🥢", "🍽️", "🍴", "🥄"] }
  ];

  const onEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (menuPopupRef.current && !menuPopupRef.current.contains(event.target)) {
        setShowMenuPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-[100dvh] lg:min-h-screen pt-20 lg:pt-24 pb-4 lg:pb-12 px-2 sm:px-4 lg:px-8 max-w-7xl mx-auto flex gap-0 lg:gap-6 h-[100dvh] lg:h-[90vh] relative overflow-hidden font-outfit">
      
      {/* Decorative Background Blur */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <div
        className={cn(
          "relative z-20 flex flex-col bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden h-full shadow-2xl transition-all duration-300 shrink-0",
          showSidebar ? "w-full lg:w-[22rem] opacity-100" : "w-0 opacity-0 pointer-events-none invisible",
        )}
      >
        <div className="p-5 lg:p-8 pb-4 space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Messages
            </h2>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="p-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-2xl transition-all border border-indigo-500/20 active:scale-95"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto px-2 lg:px-4 pb-4 lg:pb-8 space-y-1 lg:space-y-2 custom-scrollbar">
          {filteredChats.map((chat) => (
            <motion.div
              layout
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                if (window.innerWidth < 1024) setShowSidebar(false);
              }}
              className={cn(
                "p-4 rounded-[2rem] cursor-pointer transition-all flex items-center space-x-4 group border active:scale-[0.98]",
                activeChatId === chat.id
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-white/20 shadow-lg"
                  : "hover:bg-white/5 border-transparent hover:border-white/10",
              )}
            >
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-inner relative overflow-hidden",
                    activeChatId === chat.id ? "bg-indigo-600" : "bg-white/10",
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  {chat.avatar}
                </div>
                {chat.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-[#0a0f1d] shadow-lg" />
                )}
              </div>
              <div className="flex-grow overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "font-bold truncate transition-colors",
                    activeChatId === chat.id ? "text-white" : "text-slate-200"
                  )}>
                    {chat.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {chat.time}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate flex items-center">
                  {chat.lastMsg}
                </p>
              </div>
            </motion.div>
          ))}
          {filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-slate-600">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No results found for your search</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-grow flex flex-col bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden relative shadow-2xl transition-all duration-300 w-full",
        !showSidebar ? "flex" : "hidden lg:flex"
      )}>
        
        {/* Chat Header */}
        <div className="relative z-20 px-4 lg:px-8 py-4 lg:py-5 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-3 bg-white/5 text-white hover:bg-white/10 rounded-xl lg:rounded-2xl transition-all border border-white/10 active:scale-95"
              >
                <PanelLeftOpen className="w-5 h-5 hidden lg:block" />
                <ArrowLeft className="w-5 h-5 lg:hidden" />
              </button>
            )}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                {activeChat.avatar}
              </div>
              {activeChat.online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-[#0a0f1d] shadow-lg" />
              )}
            </div>
            <div>
              <h3 className="text-white font-black text-lg tracking-tight leading-none mb-1.5">
                {activeChat.name}
              </h3>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  activeChat.online ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                )} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  {activeChat.online ? "Active Now" : "Last seen recently"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            <button className="p-2.5 lg:p-3 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/10 active:scale-95 hidden sm:block">
              <Phone className="w-5 h-5" />
            </button>
            <button 
              disabled={!isActiveSwap(activeChat?.swapStatus) || isGlobalBusy}
              onClick={handleJoinRoom}
              className={cn(
                "p-2.5 lg:p-3 rounded-2xl transition-all border active:scale-95 relative overflow-hidden group/vid",
                (isActiveSwap(activeChat?.swapStatus) && !isGlobalBusy) 
                  ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600 hover:text-white" 
                  : "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed"
              )}
              title={isGlobalBusy ? "You already have an ongoing course with another user" : (isActiveSwap(activeChat?.swapStatus) ? "Join Video Room" : "Accept the swap to start video calls")}
            >
              <Video className={cn("w-4 h-4 lg:w-5 lg:h-5", (isActiveSwap(activeChat?.swapStatus) && !isGlobalBusy) && "animate-pulse")} />
            </button>
            <div className="relative" ref={menuPopupRef}>
              <button 
                onClick={() => setShowMenuPopup(!showMenuPopup)}
                className="p-2.5 lg:p-3 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/10 active:scale-95"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showMenuPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl z-50 flex flex-col p-1.5"
                  >
                    <button
                      disabled={!isActiveSwap(activeChat?.swapStatus) || isGlobalBusy}
                      onClick={() => {
                        setShowMenuPopup(false);
                        handleJoinRoom();
                      }}
                      className={cn(
                        "px-4 py-3 text-sm font-black text-left transition-all rounded-xl flex items-center justify-between group",
                        (isActiveSwap(activeChat?.swapStatus) && !isGlobalBusy) 
                          ? "text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 cursor-pointer" 
                          : "text-slate-400 bg-white/5 cursor-not-allowed opacity-60"
                      )}
                    >
                      <span className="truncate uppercase tracking-wider text-xs">Joining Room</span>
                      <Video className={cn(
                         "w-4 h-4 ml-2", 
                         (isActiveSwap(activeChat?.swapStatus) && !isGlobalBusy) ? "text-white animate-pulse" : "text-slate-500"
                      )} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 lg:p-6 md:p-8 space-y-4 lg:space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
          <AnimatePresence initial={false}>
            {chatMessages.map((msg, idx) => {
              if (msg.messageType === "system") {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className="flex justify-center my-4"
                  >
                    <div className="bg-indigo-500/10 text-indigo-300 text-[10px] md:text-xs font-bold py-2 px-6 rounded-full border border-indigo-500/20 backdrop-blur-md uppercase tracking-widest">
                      {msg.text}
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  key={msg.id}
                  className={cn(
                    "flex group/msg w-full",
                    msg.own ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "relative max-w-[85%] md:max-w-[75%] p-4 rounded-[2rem] text-sm overflow-visible",
                      msg.own
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-xl shadow-indigo-600/20"
                        : "bg-white/10 backdrop-blur-xl text-slate-100 rounded-tl-none border border-white/10",
                    )}
                  >
                    {msg.messageType === "image" ? (
                      <div className="space-y-3">
                        <div className="relative group/img overflow-hidden rounded-2xl border border-white/20">
                          <img
                            src={msg.fileUrl}
                            alt="Shared"
                            className="max-h-[300px] w-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all">
                              <Download className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                        {msg.text && <p className="leading-relaxed px-1 font-medium">{msg.text}</p>}
                      </div>
                    ) : msg.messageType === "document" ? (
                      <div className="flex items-center space-x-4 bg-black/20 p-4 rounded-2xl border border-white/10 group/doc">
                        <div className="p-3 bg-indigo-500/30 rounded-xl group-hover/doc:scale-110 transition-transform">
                          <FileText className="w-8 h-8 text-indigo-300" />
                        </div>
                        <div className="flex-grow overflow-hidden">
                          <p className="font-bold truncate text-white uppercase tracking-tighter">{msg.fileName}</p>
                          <p className="text-[10px] text-indigo-300 font-bold">READY TO DOWNLOAD</p>
                        </div>
                        <a
                          href={msg.fileUrl}
                          download={msg.fileName}
                          className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    ) : msg.messageType === "video_call" ? (
                      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/20 border border-white/10 group/video h-full w-full">
                         <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3 group-hover/video:bg-indigo-500 group-hover/video:text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <Video className="w-6 h-6 text-indigo-400 group-hover/video:text-white transition-colors" />
                         </div>
                         <h4 className="text-white font-black uppercase tracking-widest text-xs mb-1">Live Video Session</h4>
                         <p className="text-slate-400 text-[10px] text-center mb-4">Click below to enter the secure room</p>
                         <button 
                            onClick={() => {
                               if (!isActiveSwap(activeChat?.swapStatus) || isGlobalBusy) {
                                 if (isGlobalBusy) alert("You are already in an ongoing swap with someone else.");
                                 else alert("This session has ended or is not yet active.");
                                 return;
                               }

                               const ids = [user?._id, activeChatId].sort();
                               const consistentRoomId = ids.join("-");
                               const joinUrl = `/video/index.html?room=${consistentRoomId}&name=${encodeURIComponent(user?.name || "Participant")}`;
                               window.open(joinUrl, "_blank");
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
                         >
                            <span>Join Now</span>
                            <Video className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    ) : (
                      <p className="leading-relaxed font-medium">{msg.text}</p>
                    )}

                    <div
                      className={cn(
                        "text-[10px] mt-2 flex items-center font-bold",
                        msg.own
                          ? "text-indigo-200/80 justify-end"
                          : "text-slate-400 justify-start",
                      )}
                    >
                      {msg.time}
                      {msg.own && (
                        <span className="ml-1.5 flex items-center">
                          {msg.status === "read" ? (
                            <CheckCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5 opacity-60" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Delete Action - Responsive for mobile */}
                    {msg.own && (
                      <button
                        onClick={() => setDeleteMessageId(msg.id)}
                        className={cn(
                          "absolute top-0 transition-all p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/50 shadow-2xl z-30 opacity-0 group-hover/msg:opacity-100",
                          "lg:-left-12 lg:right-auto right-1 top-[-10px] lg:top-0"
                        )}
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {isUploading && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-end"
              >
                <div className="bg-white/5 border border-white/10 p-4 rounded-[2rem] rounded-tr-none flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 border-3 border-indigo-500/30 rounded-full" />
                    <div className="absolute inset-0 w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-xs font-bold text-indigo-400 animate-pulse">UPLOADING...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              ref={emojiPickerRef}
              className="absolute bottom-28 left-4 right-4 lg:right-auto lg:left-8 z-50 w-auto lg:w-80 h-[50vh] lg:h-96 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/5 bg-white/5">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Select Emoji</h4>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-6">
                {emojis.map((cat) => (
                  <div key={cat.category}>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-2">{cat.category}</p>
                    <div className="grid grid-cols-6 gap-2">
                      {cat.items.map((emoji, i) => (
                        <button
                          key={`${cat.category}-${i}`}
                          onClick={() => onEmojiClick(emoji)}
                          className="text-2xl hover:bg-white/10 p-1 rounded-xl transition-all active:scale-90"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-white/5 backdrop-blur-xl border-t border-white/10">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-2 lg:space-x-4"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.7z"
              onChange={handleFileUpload}
            />
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 lg:p-4 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl lg:rounded-2xl transition-all border border-white/5 active:scale-95"
                title="Attach"
              >
                <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
            <div className="flex-grow relative group">
              <input
                type="text"
                placeholder="Message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                autoComplete="off"
                className="w-full bg-white/5 border border-white/10 rounded-full lg:rounded-3xl py-3 lg:py-4 pl-5 lg:pl-6 pr-12 lg:pr-14 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/10 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn(
                  "absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 transition-colors",
                  showEmojiPicker ? "text-indigo-400" : "text-slate-500 hover:text-indigo-400"
                )}
              >
                <Smile className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!message.trim()}
              className={cn(
                "p-3 lg:p-4 rounded-full lg:rounded-2xl transition-all shadow-xl flex items-center justify-center active:scale-90 shrink-0",
                message.trim()
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50"
                  : "bg-white/5 text-slate-600 cursor-not-allowed",
              )}
            >
              <Send className="w-5 h-5 lg:w-6 lg:h-6 ml-0.5 lg:ml-0" />
            </button>
          </form>
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewChatModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-md bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              <h2 className="text-3xl font-black text-white mb-8 tracking-tight">
                New Message
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                    Find a User
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="Type a name..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">
                    SUGGESTED CONTACTS
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {contacts.length > 0 ? (
                      contacts.map((contact, i) => (
                        <motion.div
                          key={contact.id}
                          whileHover={{ x: 6 }}
                          onClick={() => {
                            setActiveChatId(contact.id);
                            setIsNewChatModalOpen(false);
                          }}
                          className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/40 to-purple-600/40 border border-white/10 flex items-center justify-center text-white font-black text-lg">
                              {contact.name[0]}
                            </div>
                            <div>
                                <span className="text-white font-bold group-hover:text-indigo-300 transition-colors block">
                                {contact.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Skill Swapper</span>
                            </div>
                          </div>
                          <button className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg shadow-indigo-500/0 group-hover:shadow-indigo-500/20">
                            <Send className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-slate-500 text-sm font-medium italic">Start a conversation from an expert's profile!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="w-full mt-10 py-4 bg-white/5 text-slate-400 rounded-2xl hover:bg-white/10 hover:text-white transition-all font-black text-sm uppercase tracking-widest border border-white/5"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={deleteMessageId !== null}
        onClose={() => setDeleteMessageId(null)}
        onConfirm={handleDeleteMessage}
        title="Delete Message"
        message="This message will be permanently removed for everyone. Proceed?"
        confirmText="Confirm Delete"
        type="danger"
      />
    </div>
  );
}
