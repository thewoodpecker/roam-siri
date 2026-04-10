import React, { useState, useRef, useEffect } from 'react';
import './AInbox.css';

const LEXI_RESPONSES = [
  "That's a great question! Let me pull up some details for you.",
  "Absolutely! I'd love to walk you through our virtual office features.",
  "Sure thing! Want me to show you the meeting rooms first?",
  "Perfect! Let me share my screen and give you the full tour.",
  "I'll set up a quick demo room — give me just a moment!",
  "Great to hear! Our team has been loving the drop-in meetings feature.",
  "Let me show you how the Theater works for all-hands meetings.",
  "You're going to love the AI features — On-It is a game changer!",
];

const CONVERSATIONS = {
  0: {
    name: 'Sales', members: null, avatar: '/headshots/lexi-bohonnon.jpg',
    messages: [
      { id: 1, sender: 'Lexi B.', avatar: '/headshots/lexi-bohonnon.jpg', text: 'Hey! 👋 Welcome to Roam. Are you ready to take a tour with me?', time: '1m', self: false },
    ],
  },
  1: {
    name: 'Design', members: '5 members', avatar: '/headshots/grace-sutherland.jpg',
    messages: [
      { id: 1, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: 'Hey team, let\'s discuss the progress we\'ve made on the product design. Any updates or insights to share?', time: '10:24 AM', self: false },
      { id: 2, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: 'I\'ve been exploring different color schemes and typography options for the new dashboard.', time: '10:26 AM', self: false },
      { id: 3, sender: 'You', avatar: '/headshots/joe-woodward.jpg', text: 'Great work! I\'ve been working on the interaction patterns and have some prototypes ready to share.', time: '10:30 AM', self: true },
    ],
  },
  2: {
    name: 'Howard Lerman', members: null, avatar: '/headshots/howard-lerman.jpg',
    messages: [
      { id: 1, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: 'Hey, did you get a chance to look at the new office layout?', time: '9:15 AM', self: false },
      { id: 2, sender: 'You', avatar: '/headshots/joe-woodward.jpg', text: 'Yeah it looks great! Love the open floor plan concept.', time: '9:20 AM', self: true },
    ],
  },
  3: {
    name: 'Engineering', members: '12 members', avatar: '/headshots/derek-cicerone.jpg',
    messages: [
      { id: 1, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', text: 'The new API endpoints are live in staging. Please test and report any issues.', time: '11:00 AM', self: false },
      { id: 2, sender: 'You', avatar: '/headshots/joe-woodward.jpg', text: 'I\'ll check the auth flow specifically.', time: '11:10 AM', self: true },
    ],
  },
  4: {
    name: 'Rob Figueiredo', members: null, avatar: '/headshots/rob-figueiredo.jpg',
    messages: [
      { id: 1, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', text: 'Can you review the PR when you get a chance?', time: '2:00 PM', self: false },
    ],
  },
  5: {
    name: 'Chelsea Turbin', members: null, avatar: '/headshots/chelsea-turbin.jpg',
    messages: [
      { id: 1, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: 'The Q2 marketing plan looks great 👏', time: '3:30 PM', self: false },
    ],
  },
  6: {
    name: 'Product', members: '8 members', avatar: '/headshots/joe-woodward.jpg',
    messages: [
      { id: 1, sender: 'You', avatar: '/headshots/joe-woodward.jpg', text: 'We have a design review meeting tomorrow at 10 AM.', time: '4:00 PM', self: true },
    ],
  },
  7: {
    name: 'Jeff Grossman', members: null, avatar: '/headshots/jeff-grossman.jpg',
    messages: [
      { id: 1, sender: 'Jeff Grossman', avatar: '/headshots/jeff-grossman.jpg', text: 'Thanks for the heads up. Quick question about the deployment schedule.', time: '5:00 PM', self: false },
    ],
  },
};

const CHATS = [
  { id: 0, name: 'Sales', avatar: '/headshots/lexi-bohonnon.jpg', preview: 'Lexi: Are you ready to take a tour with me?', time: 'now' },
  { id: 1, name: 'Design', avatar: '/headshots/grace-sutherland.jpg', preview: 'Grace: Let\'s discuss the progress...', time: '2m' },
  { id: 2, name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', preview: 'Did you get a chance to look at...', time: '15m' },
  { id: 3, name: 'Engineering', avatar: '/headshots/derek-cicerone.jpg', preview: 'Derek: The new API endpoints...', time: '1h' },
  { id: 4, name: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', preview: 'Can you review the PR when...', time: '2h' },
  { id: 5, name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', preview: 'The Q2 marketing plan looks...', time: '3h' },
  { id: 6, name: 'Product', avatar: '/headshots/joe-woodward.jpg', preview: 'We have a design review...', time: '5h' },
  { id: 7, name: 'Jeff Grossman', avatar: '/headshots/jeff-grossman.jpg', preview: 'Thanks for the heads up...', time: '1d' },
];

export default function AInbox({ win, onDrag }) {
  const [selectedChat, setSelectedChat] = useState(0);
  const [messages, setMessages] = useState(CONVERSATIONS);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const hasScrolled = useRef(false);
  useEffect(() => {
    // Only auto-scroll after sending a message, not on mount/chat switch
    if (hasScrolled.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const convo = messages[selectedChat];
    const newMsg = {
      id: convo.messages.length + 1,
      sender: 'You',
      avatar: '/headshots/joe-woodward.jpg',
      text: inputText.trim(),
      time: 'now',
      self: true,
    };
    setMessages(prev => ({
      ...prev,
      [selectedChat]: { ...prev[selectedChat], messages: [...prev[selectedChat].messages, newMsg] },
    }));
    setInputText('');
    hasScrolled.current = true;

    // Lexi responds in the Sales chat
    if (selectedChat === 0) {
      setTimeout(() => {
        const response = LEXI_RESPONSES[Math.floor(Math.random() * LEXI_RESPONSES.length)];
        setMessages(prev => ({
          ...prev,
          0: {
            ...prev[0],
            messages: [...prev[0].messages, {
              id: prev[0].messages.length + 1,
              sender: 'Lexi B.',
              avatar: '/headshots/lexi-bohonnon.jpg',
              text: response,
              time: 'now',
              self: false,
            }],
          },
        }));
      }, 1000 + Math.random() * 2000);
    }
  };

  const convo = messages[selectedChat];

  return (
      <div className={`ainbox-window ${!win.isFocused ? 'ainbox-unfocused' : ''}`} style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }} onMouseDown={() => win.focus()}>
        {/* Header */}
        <div className="ainbox-header" onMouseDown={onDrag}>
          <div className="ainbox-traffic-lights">
            <div className="ainbox-light ainbox-light-close" onClick={(e) => { e.stopPropagation(); win.close(); }} />
            <div className="ainbox-light ainbox-light-minimize" />
            <div className="ainbox-light ainbox-light-maximize" />
          </div>
          <div className="ainbox-search">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.3 }}>
              <path d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Search</span>
          </div>
        </div>

        {/* Body */}
        <div className="ainbox-body">
          {/* Sidebar */}
          <div className="ainbox-sidebar">
            <div className="ainbox-sidebar-header">
              <span className="ainbox-sidebar-title">AInbox</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.4 }}>
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="ainbox-chat-list">
              {CHATS.map(chat => (
                <div
                  key={chat.id}
                  className={`ainbox-chat-item ${selectedChat === chat.id ? 'ainbox-chat-active' : ''}`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <img className="ainbox-chat-avatar" src={chat.avatar} alt="" />
                  <div className="ainbox-chat-info">
                    <div className="ainbox-chat-top">
                      <span className="ainbox-chat-name">{chat.name}</span>
                      <span className="ainbox-chat-time">{chat.time}</span>
                    </div>
                    <p className="ainbox-chat-preview">{chat.preview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="ainbox-messages">
            <div className="ainbox-messages-header">
              <img className="ainbox-msg-header-avatar" src={convo.avatar} alt="" />
              <div>
                <span className="ainbox-msg-header-name">{convo.name}</span>
                {convo.members && <span className="ainbox-msg-header-members">{convo.members}</span>}
              </div>
            </div>
            <div className="ainbox-messages-list">
              {convo.messages.map(msg => (
                <div key={msg.id} className={`ainbox-msg ${msg.self ? 'ainbox-msg-self' : ''}`}>
                  {!msg.self && <img className="ainbox-msg-avatar" src={msg.avatar} alt="" />}
                  <div className="ainbox-msg-content">
                    {!msg.self && <span className="ainbox-msg-sender">{msg.sender}</span>}
                    <div className={`ainbox-msg-bubble ${msg.self ? 'ainbox-msg-bubble-self' : ''}`}>
                      <p>{msg.text}</p>
                    </div>
                    <span className="ainbox-msg-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="ainbox-composer">
              <input
                ref={inputRef}
                className="ainbox-composer-input"
                placeholder={`Message ${convo.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              />
              <button className="ainbox-send-btn" onClick={sendMessage} disabled={!inputText.trim()}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
