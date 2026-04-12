import React, { createContext, useContext, useState, useRef } from 'react';

// Import initial data from AInbox
import { INITIAL_CONVERSATIONS, DM_REPLIES_BY_CHAT, DM_REPLIES_DEFAULT } from './AInbox';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState(INITIAL_CONVERSATIONS);
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
    const replies = DM_REPLIES_BY_CHAT[chatId] || DM_REPLIES_DEFAULT;
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
