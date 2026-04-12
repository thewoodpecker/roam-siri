import React, { createContext, useContext, useState, useRef } from 'react';

const ChatContext = createContext();

// Lazy init — INITIAL_CONVERSATIONS, DM_REPLIES_BY_CHAT, DM_REPLIES_DEFAULT
// are set after AInbox module loads via registerChatData()
let _initialConversations = {};
let _dmRepliesByChat = {};
let _dmRepliesDefault = [];

export function registerChatData(conversations, repliesByChat, repliesDefault) {
  _initialConversations = conversations;
  _dmRepliesByChat = repliesByChat;
  _dmRepliesDefault = repliesDefault;
}

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState(() => _initialConversations);
  const lastPicked = useRef({});

  const pickRandom = (arr, key) => {
    if (!arr || arr.length === 0) return '';
    if (arr.length <= 1) return arr[0];
    let idx;
    do { idx = Math.floor(Math.random() * arr.length); } while (arr[idx] === lastPicked.current[key] && arr.length > 1);
    lastPicked.current[key] = arr[idx];
    return arr[idx];
  };

  const getReply = (chatId) => {
    const replies = _dmRepliesByChat[chatId] || _dmRepliesDefault;
    return pickRandom(replies, 'dm-' + chatId);
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, pickRandom, getReply }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
