"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Send,
  ArrowLeft,
} from "lucide-react";
import {
  useVendorConversations,
  useVendorConversationMessages,
  useSendConversationMessage,
} from "@/hooks/use-messages";
import { QUICK_REPLIES } from "@/lib/data/quick-replies";
import { avatarStyle } from "@/lib/theme/avatar";

export default function MessagesPage() {
  const [filters, setFilters] = useState({
    filter: "active",
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [activeConversation, setActiveConversation] = useState(null); // Now stores contact email
  const [messageInput, setMessageInput] = useState("");
  const [showChat, setShowChat] = useState(false); // Mobile view toggle

  const { data: conversationsData, isLoading: loadingConversations } =
    useVendorConversations(filters);
  const { data: messages, isLoading: loadingMessages } =
    useVendorConversationMessages(activeConversation);
  const sendMessage = useSendConversationMessage();

  // DATA CHECKS
  // console.log("messages: ",messages)
  // console.log("conversationData: ",conversationsData)

  const handleSearch = (value) => {
    setSearchInput(value);
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleFilterChange = (filter) => {
    setFilters((prev) => ({ ...prev, filter }));
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && activeConversation) {
      sendMessage.mutate({
        contactEmail: activeConversation,
        message: messageInput.trim(),
      });
      setMessageInput("");
    }
  };

  const handleQuickReply = (reply) => {
    setMessageInput(reply);
  };

  const handleSelectConversation = (contactEmail) => {
    setActiveConversation(contactEmail);
    setShowChat(true); // Show chat on mobile when conversation selected
  };

  const handleBackToList = () => {
    setShowChat(false);
  };

  // Set initial conversation if none selected
  useEffect(() => {
    if (conversationsData?.conversations?.length > 0 && !activeConversation) {
      setActiveConversation(conversationsData.conversations[0].id);
    }
  }, [conversationsData, activeConversation]);

  const activeConv = conversationsData?.conversations?.find(
    (c) => c.id === activeConversation,
  );

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-background overflow-hidden">
      {/* Page Header - Above everything */}
      <div className="px-4 md:px-6 py-4 md:py-6 bg-surface border-b border-white/08">
        <div className="flex items-center gap-3">
          {/* Mobile back button */}
          {showChat && (
            <button
              onClick={handleBackToList}
              className="md:hidden p-2 -ml-2 text-muted hover:bg-white/05 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="font-manrope text-[20px] md:text-[24px] font-bold text-white mb-1 truncate">
              Message Center
            </h1>
            <p className="font-manrope text-[12px] md:text-[13px] text-muted hidden sm:block">
              View all your conversations and updates in one place, with
              everything you need to stay informed and connected.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Conversations List */}
        <div
          className={`
          w-full md:w-85 bg-surface border-r border-white/08 flex flex-col
          ${showChat ? "hidden md:flex" : "flex"}
        `}
        >
          {/* Search */}
          <div className="p-4 border-b border-white/08">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                size={18}
              />
              <input
                type="text"
                placeholder="Search name, ID or phone..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/05 border border-white/08 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 px-4 py-3 border-b border-white/08 overflow-x-auto">
            <button
              onClick={() => handleFilterChange("active")}
              className={`
                px-2 md:px-4 py-1.5 rounded-lg font-manrope text-[13px] font-medium transition-colors whitespace-nowrap shrink-0
                ${
                  filters.filter === "active"
                    ? "bg-accent-solid text-white"
                    : "bg-white/05 text-muted hover:bg-white/08"
                }
              `}
            >
              Active ({conversationsData?.counts?.active || 0})
            </button>
            <button
              onClick={() => handleFilterChange("pending")}
              className={`
                px-2 md:px-4 py-1.5 rounded-lg font-manrope text-[13px] font-medium transition-colors whitespace-nowrap shrink-0
                ${
                  filters.filter === "pending"
                    ? "bg-accent-solid text-white"
                    : "bg-white/05 text-muted hover:bg-white/08"
                }
              `}
            >
              Pending ({conversationsData?.counts?.pending || 0})
            </button>
            <button
              onClick={() => handleFilterChange("closed")}
              className={`
                px-2 md:px-4 py-1.5 rounded-lg font-manrope text-[13px] font-medium transition-colors whitespace-nowrap shrink-0
                ${
                  filters.filter === "closed"
                    ? "bg-accent-solid text-white"
                    : "bg-white/05 text-muted hover:bg-white/08"
                }
              `}
            >
              Closed
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            {loadingConversations ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-white/08 border-t-accent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted font-manrope text-[13px]">
                  Loading conversations...
                </p>
              </div>
            ) : conversationsData?.conversations?.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted font-manrope text-[13px]">
                  No conversations found
                </p>
              </div>
            ) : (
              conversationsData?.conversations?.map((conversation, index) => (
                <motion.button
                  key={conversation.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`
                  w-full p-4 flex items-start gap-3 border-b border-white/08 transition-colors text-left
                  ${
                    activeConversation === conversation.id
                      ? "bg-white/05"
                      : "hover:bg-white/05"
                  }
                `}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-manrope text-[14px] font-bold"
                      style={avatarStyle(conversation.id)}
                    >
                      {conversation.contactInitials}
                    </div>
                    {conversation.unread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-success-solid rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-manrope text-[14px] font-bold text-white truncate">
                        {conversation.contactName}
                      </h3>
                      <span className="font-manrope text-[12px] text-muted shrink-0 ml-2">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p
                      className={`
                      font-manrope text-[13px] truncate
                      ${conversation.unread ? "text-white font-medium" : "text-muted"}
                      ${conversation.status === "Missed Call" ? "text-danger" : ""}
                    `}
                    >
                      {conversation.lastMessage}
                    </p>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div
          className={`
          flex-1 flex flex-col bg-surface
          ${showChat ? "flex" : "hidden md:flex"}
        `}
        >
          {/* Chat Header */}
          {activeConv && (
            <div className="p-4 md:p-6 border-b border-white/08 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-manrope text-[14px] md:text-[16px] font-bold relative shrink-0"
                    style={avatarStyle(activeConv.id)}
                >
                  {activeConv.contactInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-manrope text-[15px] md:text-[16px] font-bold text-white truncate">
                      {activeConv.contactName}
                    </h2>
                    {activeConv.contactRole && (
                      <span className="px-2 py-0.5 bg-success-solid text-white rounded font-manrope text-[16px] font-bold shrink-0">
                        {activeConv.contactRole}
                      </span>
                    )}
                    {activeConv.orderId && (
                      <span className="px-2 py-0.5 bg-accent-solid text-white rounded font-manrope text-[16px] font-bold shrink-0">
                        {activeConv.orderId}
                      </span>
                    )}
                  </div>
                  <p className="font-manrope text-[11px] md:text-[12px] text-muted truncate">
                    We messaged • Last active 25m ago
                  </p>
                </div>
              </div>
              <button className="p-2 text-muted hover:bg-white/05 rounded-lg transition-colors shrink-0">
                <MoreVertical size={20} />
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-white/08 border-t-accent rounded-full animate-spin mx-auto mb-3" />
                  <p className="font-manrope text-[14px] text-muted">
                    Loading messages...
                  </p>
                </div>
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="font-manrope text-[14px] text-muted">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              <>
                {/* Today Label */}
                <div className="flex items-center justify-center mb-6">
                  <div className="px-4 py-1 bg-accent-solid text-white rounded-full font-manrope text-[11px] font-bold">
                    Today
                  </div>
                </div>

                {/* Messages */}
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-2 md:gap-3 ${message.sender === "vendor" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "customer" && (
                      <div
                        className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-manrope text-[11px] md:text-[12px] font-bold shrink-0"
                        style={{
                          backgroundColor: `color-mix(in oklab,  14%, transparent)`,
                          color: message.color,
                        }}
                      >
                        {message.initials}
                      </div>
                    )}

                    <div
                      className={`
                        max-w-[85%] md:max-w-125 px-3 md:px-4 py-2 md:py-3 rounded-2xl
                        ${
                          message.sender === "vendor"
                            ? "bg-white/05 text-white"
                            : "bg-warning/10 text-white"
                        }
                      `}
                    >
                      <p className="font-manrope text-[13px] md:text-[14px] leading-relaxed wrap-break-word">
                        {message.message}
                      </p>
                      <p className="font-manrope text-[11px] text-muted mt-1">
                        {message.timestamp}
                      </p>
                    </div>

                    {message.sender === "vendor" && (
                      <div
                        className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-manrope text-[11px] md:text-[12px] font-bold shrink-0"
                        style={{
                          backgroundColor: `color-mix(in oklab,  14%, transparent)`,
                          color: message.color,
                        }}
                      >
                        {message.initials}
                      </div>
                    )}
                  </motion.div>
                ))}
              </>
            )}
          </div>

          {/* Quick Replies */}
          <div className="px-4 md:px-6 py-3 border-t border-white/08">
            <div className="flex flex-wrap md:flex-nowrap gap-1 md:gap-2 overflow-x-auto pb-2 -mb-2">
              {QUICK_REPLIES.map((reply, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickReply(reply)}
                  className="px-2 md:px-4 py-1 md:py-2 bg-surface-raised border border-white/10 rounded-full font-manrope text-xs md:text-[13px] text-muted hover:bg-white/05 hover:border-accent hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  {reply}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 md:p-6 border-t border-white/08">
            <div className="flex items-center gap-2 md:gap-3">
              {/* Attachment buttons - Hidden on mobile */}
              <div className="hidden sm:flex gap-2">
                <button className="p-2 text-muted hover:bg-white/05 rounded-lg transition-colors">
                  <Paperclip size={20} />
                </button>
                <button className="p-2 text-muted hover:bg-white/05 rounded-lg transition-colors">
                  <Smile size={20} />
                </button>
                <button className="p-2 text-muted hover:bg-white/05 rounded-lg transition-colors">
                  <ImageIcon size={20} />
                </button>
              </div>

              {/* Text input */}
              <div className="md:flex-1">
                <textarea
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  className="md:w-full px-3 md:px-4 py-2 md:py-3 bg-white/05 border border-white/08 rounded-lg font-manrope text-[13px] md:text-[14px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent resize-none"
                />
              </div>

              {/* Send button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendMessage.isPending}
                className="px-4 md:px-6 py-2 md:py-3 bg-accent-solid text-white rounded-lg font-manrope text-[13px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="hidden sm:inline">
                  {sendMessage.isPending ? "Sending…" : "Send"}
                </span>
                {sendMessage.isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Send size={16} />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
