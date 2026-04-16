import React, { useState, useRef, useEffect } from 'react';
import { useChat } from './ChatContext';
import { TypingIndicator } from './AInbox';
import { useWindowManager } from './WindowManager';
import './MiniChat.css';

/* Map avatar paths to chat IDs */
const AVATAR_TO_CHAT = {
  '/headshots/grace-sutherland.jpg': 'grace',
  '/headshots/rob-figueiredo.jpg': 'rob',
  '/headshots/will-hou.jpg': 'will',
  '/headshots/howard-lerman.jpg': 'howard-fav',
  '/headshots/thomas-grapperon.jpg': 'thomas',
  '/headshots/lexi-bohonnon.jpg': 'lexi',
  '/headshots/derek-cicerone.jpg': 'derek-mini',
  '/headshots/chelsea-turbin.jpg': 'chelsea-mini',
  '/headshots/klas-leino.jpg': 'klas-mini',
  '/headshots/jeff-grossman.jpg': 'jeff-mini',
  '/headshots/jon-brod.jpg': 'jon-mini',
  '/headshots/keegan-lanzillotta.jpg': 'keegan-mini',
  '/headshots/arnav-bansal.jpg': 'arnav-mini',
  '/headshots/michael-miller.jpg': 'michael-mini',
  '/headshots/john-moffa.jpg': 'john-mini',
  '/headshots/tom-dixon.jpg': 'tom-mini',
  '/headshots/sean-macisaac.jpg': 'sean-mini',
  '/headshots/peter-lerman.jpg': 'peter-mini',
  '/headshots/aaron-wadhwa.jpg': 'aaron-mini',
  '/headshots/mattias-leino.jpg': 'mattias-mini',
  '/headshots/garima-kewlani.jpg': 'garima-mini',
  '/headshots/michael-walrath.jpg': 'walrath-mini',
  '/headshots/john-huffsmith.jpg': 'huffsmith-mini',
  '/headshots/john-beutner.jpg': 'beutner-mini',
  '/headshots/joe-woodward.jpg': 'joe-mini',
};

export function getChatIdForAvatar(avatar) {
  return AVATAR_TO_CHAT[avatar] || null;
}

function DmBubble({ msg, isFirstInGroup }) {
  const [translated, setTranslated] = useState(false);
  if (msg.type === 'wave') {
    return (
      <div className="mc-wave">
        <span>{msg.text}</span>
        <span>👋</span>
      </div>
    );
  }
  const radiusIn = isFirstInGroup ? '18px 18px 18px 4px' : '4px 18px 18px 4px';
  const radiusOut = isFirstInGroup ? '20px 20px 4px 20px' : '20px 4px 4px 20px';
  const displayText = translated && msg.translation ? msg.translation : msg.text;
  return (
    <div className={`mc-msg ${msg.self ? 'mc-msg-self' : ''} ${!isFirstInGroup ? 'mc-msg-consecutive' : ''}`}>
      <div className={`mc-msg-bubble ${msg.self ? 'mc-msg-bubble-self' : ''}`} style={{ borderRadius: msg.self ? radiusOut : radiusIn }}>
        <p>{displayText}</p>
        {msg.translation && (
          <button
            type="button"
            className="mc-translate-btn"
            onClick={() => setTranslated(t => !t)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 8 6 6" />
              <path d="m4 14 6-6 2-3" />
              <path d="M2 5h12" />
              <path d="M7 2h1" />
              <path d="m22 22-5-10-5 10" />
              <path d="M14 18h6" />
            </svg>
            {translated ? 'Show original' : 'Translate'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MiniChat({ personName, personAvatar, chatId, position, onClose }) {
  const { messages, setMessages, getReply } = useChat();
  const { state: wmState, register, unregister, focus: wmFocus } = useWindowManager();
  const wmId = 'mc-' + chatId;

  // Register with window manager on mount
  useEffect(() => {
    register(wmId, position);
    return () => unregister(wmId);
  }, []);

  const wmWin = wmState.windows[wmId];
  const [inputText, setInputText] = useState('');
  const [closing, setClosing] = useState(false);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const dmTimer = useRef(null);

  // Cleanup dmTimer on unmount
  useEffect(() => {
    return () => {
      if (dmTimer.current) {
        dmTimer.current.forEach(t => clearTimeout(t));
      }
    };
  }, []);

  // Ensure conversation exists
  useEffect(() => {
    setMessages(prev => {
      if (prev[chatId]) return prev;
      const greeting = [
        "Hey! 👋 What's up?",
        "Hey there! How's it going?",
        "Hi! Got a minute?",
        "Hey! Quick question for you.",
        "Yo! 👋 You around?",
        "Hey! Hope you're having a good day!",
      ][Math.floor(Math.random() * 6)];
      // Pre-populate with a short back-and-forth
      const firstReply = getReply(chatId);
      const thirdMsg = typeof firstReply === 'object' && firstReply.text
        ? { id: 3, self: false, text: firstReply.text, translation: firstReply.translation }
        : { id: 3, self: false, text: firstReply };
      return {
        ...prev,
        [chatId]: {
          type: 'dm', name: personName, subtitle: 'Member of Roam HQ',
          avatar: personAvatar,
          messages: [
            { id: 1, self: false, text: greeting },
            { id: 2, self: true, text: "Hey! What's new?" },
            thirdMsg,
          ],
        },
      };
    });
  }, [chatId]);

  const convo = messages[chatId];

  // Scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [convo?.messages?.length]);

  // Focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
  }, []);

  // Auto-type on open — fire once after convo exists
  const hasAutoTyped = useRef(false);
  useEffect(() => {
    if (!convo || hasAutoTyped.current) return;
    hasAutoTyped.current = true;
    const typingDelay = 800 + Math.random() * 1200;
    const sendDelay = typingDelay + 2000 + Math.random() * 2000;
    const t1 = setTimeout(() => {
      setMessages(prev => {
        const c = prev[chatId];
        if (!c) return prev;
        return { ...prev, [chatId]: { ...c, typingAvatars: [personAvatar] } };
      });
    }, typingDelay);
    const t2 = setTimeout(() => {
      setMessages(prev => {
        const c = prev[chatId];
        if (!c) return prev;
        const raw = getReply(chatId);
        const reply = typeof raw === 'object' && raw.text
          ? { id: Date.now() + Math.random(), self: false, text: raw.text, translation: raw.translation }
          : { id: Date.now() + Math.random(), self: false, text: raw };
        return { ...prev, [chatId]: { ...c, typingAvatars: null, messages: [...c.messages, reply] } };
      });
    }, sendDelay);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [convo != null]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  const sendMessage = () => {
    if (!inputText.trim() || !convo) return;
    const msg = { id: Date.now(), self: true, text: inputText.trim() };
    setMessages(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId], messages: [...prev[chatId].messages, msg] },
    }));
    setInputText('');

    // Auto-reply — use two independent timers
    if (dmTimer.current) { dmTimer.current.forEach(t => clearTimeout(t)); }
    const typingDelay = 800 + Math.random() * 1200;
    const sendDelay = typingDelay + 1500 + Math.random() * 2500;
    const rt1 = setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [chatId]: { ...prev[chatId], typingAvatars: [personAvatar] },
      }));
    }, typingDelay);
    const rt2 = setTimeout(() => {
      setMessages(prev => {
        const c = prev[chatId];
        if (!c) return prev;
        const raw = getReply(chatId);
        const reply = typeof raw === 'object' && raw.text
          ? { id: Date.now() + Math.random(), self: false, text: raw.text, translation: raw.translation }
          : { id: Date.now() + Math.random(), self: false, text: raw };
        return { ...prev, [chatId]: { ...c, typingAvatars: null, messages: [...c.messages, reply] } };
      });
    }, sendDelay);
    dmTimer.current = [rt1, rt2];
  };

  const getDmGroups = (msgs) => {
    if (!msgs) return [];
    return msgs.map((msg, i) => {
      const prev = msgs[i - 1];
      const isFirstInGroup = !prev || prev.type || prev.self !== msg.self;
      return { ...msg, isFirstInGroup };
    });
  };

  // Drag handler for titlebar
  const [pos, setPos] = useState(position);
  const handleDrag = (e) => {
    if (e.target.closest('.mc-light')) return;
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startPos = { ...pos };
    const onMove = (ev) => setPos({ x: startPos.x + ev.clientX - startX, y: startPos.y + ev.clientY - startY });
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (!convo) return null;

  return (
    <div
      className={`mc-window ${closing ? 'mc-closing' : ''}`}
      style={{ left: pos.x, top: pos.y, zIndex: wmWin?.zIndex || 1 }}
      onMouseDown={() => { wmFocus(wmId); setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50); }}
    >
      {/* Header / Titlebar */}
      <div className="mc-header" onMouseDown={handleDrag}>
        <div className="mc-traffic-lights">
          <div className="mc-light mc-light-close" onClick={handleClose} />
          <div className="mc-light mc-light-minimize" />
          <div className="mc-light mc-light-maximize" />
        </div>
        <div className="mc-header-center">
          <img src={personAvatar} alt="" className="mc-header-avatar" />
          <span className="mc-header-name">{personName}</span>
        </div>
      </div>

      {/* Body */}
      <div className="mc-body">
        {/* Messages */}
        <div className="mc-messages" ref={messagesRef}>
          {getDmGroups(convo.messages).map(msg => (
            <DmBubble key={msg.id} msg={msg} isFirstInGroup={msg.isFirstInGroup} />
          ))}
        </div>

        {/* Composer — same style as AInbox */}
        <div className="ainbox-composer">
          <TypingIndicator avatars={convo.typingAvatars} />
          <div className="ainbox-composer-box">
            <div className="ainbox-composer-field">
              <input
                ref={inputRef}
                placeholder="Write a Message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              />
            </div>
            <div className="ainbox-composer-toolbar">
              <div className="ainbox-toolbar-plus">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="ainbox-toolbar-spacer" />
              <div className="ainbox-toolbar-group">
                <img src="/icons/composer/Send.svg" alt="" className={`ainbox-toolbar-img ainbox-send-icon ${inputText.trim() ? 'ainbox-send-active' : ''}`} title="Send" onClick={sendMessage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
