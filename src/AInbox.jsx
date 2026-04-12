import React, { useState, useRef, useEffect } from 'react';
import './AInbox.css';

/* ———————————————————————————————————————
   Data
——————————————————————————————————————— */

const FAVORITES = [
  { id: 'will', name: 'Will', avatar: '/headshots/will-hou.jpg', type: 'dm' },
  { id: 'howard-fav', name: 'Howard', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
  { id: 'design', name: 'Design', avatar: '/groups/Group Design.png', type: 'group' },
];

const SIDEBAR_SECTIONS = [
  {
    id: 'dms', label: 'Direct Messages',
    items: [
      { id: 'grace', name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', type: 'dm' },
      { id: 'rob', name: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', type: 'dm' },
    ],
  },
  {
    id: 'meetings', label: 'Meetings',
    items: [
      { id: 'meet-design', name: 'Inbox Design Discussion', type: 'meeting' },
      { id: 'meet-standup', name: 'Standup', type: 'meeting' },
    ],
  },
  {
    id: 'groups', label: 'My Groups',
    items: [
      { id: 'design', name: 'Design', groupImg: '/groups/Group Design.png', type: 'group', memberCount: 35 },
      { id: 'engineering', name: 'Engineering', groupImg: '/groups/Group Computer.png', type: 'group', memberCount: 12 },
      { id: 'product', name: 'Product', groupImg: '/groups/Group Features.png', type: 'group', memberCount: 8 },
      { id: 'all-hands', name: 'All-Hands', groupImg: '/groups/Group Roam.png', type: 'group', memberCount: 45 },
      { id: 'ios', name: 'iOS', groupImg: '/groups/Group Apple.png', type: 'group', memberCount: 6 },
      { id: 'android', name: 'Android', groupImg: '/groups/Group Android.png', type: 'group', memberCount: 4 },
    ],
  },
  {
    id: 'threads', label: 'Threads',
    items: [
      { id: 'thread-1', name: "I've been working on the initial concept...", type: 'thread', threadRef: { chatId: 'design', messageId: 2 } },
      { id: 'thread-2', name: "That's great to hear, John...", type: 'thread', threadRef: { chatId: 'design', messageId: 3 } },
    ],
  },
];

const CONVERSATIONS = {
  /* ——— Group: Design ——— */
  design: {
    type: 'group', name: 'Design', memberCount: 35,
    groupImg: '/groups/Group Design.png',
    avatars: ['/headshots/grace-sutherland.jpg', '/headshots/tom-dixon.jpg', '/headshots/joe-woodward.jpg'],
    pinnedItems: [
      { label: "It's Nice That", emoji: null, avatar: '/favicon-design-1.png' },
      { label: 'Dribbble', emoji: null, avatar: '/favicon-design-dribbble.png' },
    ],
    typingAvatars: ['/headshots/will-hou.jpg'],
    messages: [
      {
        id: 1, sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', time: 'Weds 8:29 AM',
        text: "Good morning, everyone! Today, let's discuss the progress we've made so far on the product design. Any updates or insights to share?",
      },
      {
        id: 2, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Weds 2:55 PM',
        text: "I've been working on the initial concept sketches based on the user research we conducted last week. I focused on addressing the pain points and incorporating the feedback we received.",
        thread: {
          count: 3, lastReply: 'today 10:45 AM',
          replies: [
            { id: 'r1', sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', text: "I've been working on the initial concept sketches based on the user research we conducted last week. I focused on addressing the pain points and incorporating the feedback we received." },
            { id: 'r2', sender: 'Tom Dixon', avatar: '/headshots/tom-dixon.jpg', text: "That's great to hear, Group Member 2. I'm excited to see what you've come up with. In the meantime, I've been exploring different color schemes and typography options to create a visually appealing and cohesive design language." },
            { id: 'r3', sender: 'Michael Miller', avatar: '/headshots/michael-miller.jpg', text: "That's great, Tom! I've started testing the new user flow on the app. I noticed that the contrast on the buttons seems a bit low with the current colors. Can we revisit the accessibility guidelines to make sure everything is compliant?" },
          ],
        },
      },
      {
        id: 3, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: 'Thu 7:25 PM',
        text: "That's great to hear, John. I'm excited to see what you've come up with. In the meantime, I've been exploring different color schemes and typography options to create a visually appealing and cohesive design language.",
        thread: {
          count: 3, lastReply: 'today 10:45 AM',
          replies: [
            { id: 'r1', sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', text: "Michael, that's a good catch. Accessibility is crucial. Maybe we can schedule a quick call to go over the color contrast issues? We can also look at the latest WCAG guidelines together." },
            { id: 'r2', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "Absolutely, Klas. Let's set up a call for later today to address the color contrast and any other accessibility concerns. We want to ensure our design is inclusive and user-friendly." },
            { id: 'r3', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "I can share the latest WCAG 2.1 guidelines document. I've been reviewing it and there are some new recommendations we should follow." },
          ],
        },
      },
      {
        id: 4, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Fri 2:34 PM',
        text: "Hey team, just a reminder that we have a design review meeting tomorrow at 10 AM. Please make sure your latest prototypes are uploaded to the shared folder by end of day.",
        thread: {
          count: 4, lastReply: 'today 11:20 AM',
          replies: [
            { id: 'r1', sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', text: "Got it! I'll have the wireframes uploaded by 5 PM." },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Mine are ready, just need to export the final screens." },
            { id: 'r3', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "Should we also prepare the component inventory doc?" },
            { id: 'r4', sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', text: "Yes, please include the component inventory. Thanks everyone!" },
          ],
        },
      },
      {
        id: 5, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: 'Fri 2:59 PM',
        text: "I've pushed the updated component library to the repo. The new spacing tokens and border-radius system are all in place — everything matches the Figma specs now.",
        thread: {
          count: 2, lastReply: 'today 9:30 AM',
          replies: [
            { id: 'r1', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Nice! The border-radius tokens look clean. I'll update the card components to use them." },
            { id: 'r2', sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', text: "Spacing feels great. The 8px grid is so much more consistent now." },
          ],
        },
      },
      {
        id: 6, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: 'Fri 3:02 PM',
        text: "The icon set redesign is done — 48 icons, all on a 16px grid with consistent 1px stroke weight. I'll share the Figma link for the final review.",
        thread: {
          count: 3, lastReply: 'today 10:15 AM',
          replies: [
            { id: 'r1', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "These look amazing! Can we also get a filled variant for the active states?" },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Already on it — filled variants are about 60% done. Should have them by Monday." },
            { id: 'r3', sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', text: "Love the consistency. The stroke weight feels perfect at this scale." },
          ],
        },
      },
      {
        id: 7, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: 'Fri 3:19 PM',
        text: "I've updated the color system with the new semantic tokens. Dark mode and light mode are both looking great. Let me know if you have any suggestions.",
        thread: {
          count: 2, lastReply: 'today 11:00 AM',
          replies: [
            { id: 'r1', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "The dark mode surface hierarchy is really nice. Love the graphite scale." },
            { id: 'r2', sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', text: "Light mode looks clean too. The opacity-based borders blend way better than the old solid ones." },
          ],
        },
      },
      {
        id: 8, sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', time: 'Fri 3:35 PM',
        text: "The onboarding flow redesign is ready for review. I've simplified it from 6 screens down to 3 — way less friction for new users.",
        thread: {
          count: 3, lastReply: 'today 9:45 AM',
          replies: [
            { id: 'r1', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "3 screens is perfect. Can we A/B test it against the current flow?" },
            { id: 'r2', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "I'll set up the experiment. We should see results within a week." },
            { id: 'r3', sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', text: "Great — I'll also prepare a version with an optional tour for power users." },
          ],
        },
      },
      {
        id: 9, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Fri 3:50 PM',
        text: "Love the direction on onboarding. Can we also add a quick tour tooltip for the virtual office? First-time users need to understand the floor concept.",
      },
      {
        id: 10, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: 'Fri 4:05 PM',
        text: "Just finished the motion design specs for the room transitions. 300ms ease-out for entering, 200ms ease-in for leaving. Feels really smooth.",
        thread: {
          count: 2, lastReply: 'today 10:30 AM',
          replies: [
            { id: 'r1', sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', text: "The easing curves feel great. I'll implement these in the CSS transitions today." },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Can we use the same timing for the story viewer open/close? It should feel connected." },
          ],
        },
      },
      {
        id: 11, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: 'Fri 4:20 PM',
        text: "The story bubbles above avatars are looking perfect now. The ring animation syncs with the audio — it feels very native.",
      },
      {
        id: 12, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Fri 4:35 PM',
        text: "Great work this week everyone. The design system is really coming together. Let's sync Monday to plan the next sprint.",
        thread: {
          count: 2, lastReply: 'Fri 5:00 PM',
          replies: [
            { id: 'r1', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Awesome week! I'll prep the sprint retro board over the weekend." },
            { id: 'r2', sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', text: "See you all Monday. Great momentum this week!" },
          ],
        },
      },
    ],
  },

  /* ——— Group: Engineering ——— */
  engineering: {
    type: 'group', name: 'Engineering', memberCount: 12,
    groupImg: '/groups/Group Computer.png',
    avatars: ['/headshots/derek-cicerone.jpg', '/headshots/rob-figueiredo.jpg'],
    messages: [
      {
        id: 1, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Today 9:00 AM',
        text: 'The new API endpoints are live in staging. Please test and report any issues before we cut the release.',
        thread: {
          count: 2, lastReply: 'today 9:30 AM',
          replies: [
            { id: 'r1', sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', text: "Running the test suite now. The auth endpoints look good so far." },
            { id: 'r2', sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', text: "Found a minor issue with the pagination params — I'll open a PR." },
          ],
        },
      },
      { id: 2, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: 'Today 9:15 AM', text: "Integration tests are all green. The WebSocket reconnection logic is working perfectly now." },
      { id: 3, sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', time: 'Today 9:25 AM', text: "Just merged the memory leak fix for the chat module. Should reduce crash rates on older devices by ~40%." },
      { id: 4, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Today 9:40 AM', text: "Nice work. Let's also review the database migration script before deploying to production. I want to make sure the rollback plan is solid." },
    ],
  },

  /* ——— Group: Product ——— */
  product: {
    type: 'group', name: 'Product', memberCount: 8,
    groupImg: '/groups/Group Features.png',
    avatars: ['/headshots/joe-woodward.jpg', '/headshots/chelsea-turbin.jpg'],
    messages: [
      {
        id: 1, sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', time: 'Today 10:00 AM',
        text: "Q3 roadmap draft is ready for review. I've prioritized the AInbox improvements and the new onboarding flow based on the user research findings.",
        thread: {
          count: 3, lastReply: 'today 10:30 AM',
          replies: [
            { id: 'r1', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "Love the prioritization. Should we also factor in the enterprise SSO requests?" },
            { id: 'r2', sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', text: "Yes, SSO is a top request from our enterprise pipeline. Let's slot it into the first half of Q3." },
            { id: 'r3', sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', text: "Good call. I'll update the roadmap and send it out for final sign-off." },
          ],
        },
      },
      { id: 2, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: 'Today 10:15 AM', text: "The competitive analysis is done. Roam's virtual office UX is way ahead, but we need to close the gap on async messaging features." },
      { id: 3, sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', time: 'Today 10:25 AM', text: "Customer churn data from March shows that teams using AInbox daily have 3x better retention. We should double down on chat adoption." },
    ],
  },

  /* ——— Group: All-Hands ——— */
  'all-hands': {
    type: 'group', name: 'All-Hands', memberCount: 45,
    groupImg: '/groups/Group Roam.png',
    avatars: ['/headshots/howard-lerman.jpg', '/headshots/grace-sutherland.jpg'],
    messages: [
      {
        id: 1, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Mon 2:00 PM',
        text: "Incredible quarter, team! Revenue up 47%, user growth at an all-time high, and the product has never been better. Let's keep this momentum going into Q3.",
        thread: {
          count: 2, lastReply: 'Mon 3:15 PM',
          replies: [
            { id: 'r1', sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', text: "Huge shoutout to the engineering team for shipping the new infra ahead of schedule." },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "And the design team crushed the rebrand. Excited for what's next!" },
          ],
        },
      },
      { id: 2, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: 'Mon 2:15 PM', text: "Marketing highlight: the virtual office launch campaign drove 12K signups in the first week. Biggest launch we've ever had." },
      { id: 3, sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', time: 'Mon 2:20 PM', text: "Product update: AInbox, Stories, and the new mobile app are all shipping this quarter. It's going to be a big one." },
      { id: 4, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Mon 2:30 PM', text: "Engineering is fully staffed and we've cut deploy times by 60%. The new CI pipeline is a game changer." },
    ],
  },

  /* ——— Group: iOS ——— */
  ios: {
    type: 'group', name: 'iOS', memberCount: 6,
    groupImg: '/groups/Group Apple.png',
    avatars: ['/headshots/keegan-lanzillotta.jpg', '/headshots/john-moffa.jpg'],
    messages: [
      {
        id: 1, sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', time: 'Today 8:00 AM',
        text: 'New TestFlight build (v3.2.1) is up. Major changes: updated chat UI, push notification overhaul, and the new drop-in animations.',
        thread: {
          count: 2, lastReply: 'today 8:45 AM',
          replies: [
            { id: 'r1', sender: 'John Moffa', avatar: '/headshots/john-moffa.jpg', text: "Downloading now. I'll focus on the message threading flow and the new swipe gestures." },
            { id: 'r2', sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', text: "Thanks! Also check the push notification permissions — that was flaky on iOS 18 last build." },
          ],
        },
      },
      { id: 2, sender: 'John Moffa', avatar: '/headshots/john-moffa.jpg', time: 'Today 8:30 AM', text: "The haptic feedback on message reactions feels great. One thing — the keyboard dismiss animation stutters on iPhone 15 Pro. I'll file a ticket." },
      { id: 3, sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', time: 'Today 8:50 AM', text: "Good catch. Also, Apple approved our Live Activities entitlement — we can now show active meetings on the Lock Screen." },
    ],
  },

  /* ——— Group: Android ——— */
  android: {
    type: 'group', name: 'Android', memberCount: 4,
    groupImg: '/groups/Group Android.png',
    avatars: ['/headshots/arnav-bansal.jpg', '/headshots/michael-miller.jpg'],
    messages: [
      {
        id: 1, sender: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg', time: 'Today 11:00 AM',
        text: 'Android release candidate v3.2.0 is ready for QA. Key changes: Material You theming, notification channels rewrite, and Bluetooth audio routing fix.',
        thread: {
          count: 2, lastReply: 'today 11:30 AM',
          replies: [
            { id: 'r1', sender: 'Michael Miller', avatar: '/headshots/michael-miller.jpg', text: "Testing on Pixel 8 and Samsung S24. The Material You colors look fantastic with our design tokens." },
            { id: 'r2', sender: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg', text: "Great! Pay close attention to the notification channels — we changed the targeting logic for Android 14+." },
          ],
        },
      },
      { id: 2, sender: 'Michael Miller', avatar: '/headshots/michael-miller.jpg', time: 'Today 11:20 AM', text: "Battery usage is down 25% compared to last build. The background service optimization really paid off." },
      { id: 3, sender: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg', time: 'Today 11:35 AM', text: "Play Store listing needs updating with the new screenshots. I'll handle it once QA signs off." },
    ],
  },

  /* ——— Meeting: Inbox Design Discussion ——— */
  'meet-design': {
    type: 'meeting', name: 'Inbox Design Discussion',
    groupImg: '/icons/magic-quill.svg',
    avatars: ['/headshots/grace-sutherland.jpg', '/headshots/howard-lerman.jpg', '/headshots/joe-woodward.jpg'],
    memberCount: 5,
    timeline: {
      avatars: [
        { src: '/headshots/grace-sutherland.jpg', pos: 5 },
        { src: '/headshots/howard-lerman.jpg', pos: 8 },
        { src: '/headshots/joe-woodward.jpg', pos: 15 },
        { src: '/headshots/rob-figueiredo.jpg', pos: 20 },
        { src: '/headshots/howard-lerman.jpg', pos: 35 },
        { src: '/headshots/grace-sutherland.jpg', pos: 42 },
        { src: '/headshots/joe-woodward.jpg', pos: 55 },
        { src: '/headshots/rob-figueiredo.jpg', pos: 60 },
        { src: '/headshots/chelsea-turbin.jpg', pos: 72 },
        { src: '/headshots/grace-sutherland.jpg', pos: 80 },
        { src: '/headshots/howard-lerman.jpg', pos: 85 },
        { src: '/headshots/joe-woodward.jpg', pos: 95 },
      ],
    },
    messages: [
      { id: 1, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: 'Today 9:00 AM', text: "Let's kick off the inbox design discussion. I've prepared some wireframes based on the user feedback." },
      { id: 2, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Today 9:05 AM', text: "Great, I've been thinking about the folder system. Users really want drag-and-drop reordering." },
      { id: 3, sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', time: 'Today 9:10 AM', text: "Agreed. The pinned items and collapsible sections tested really well in the prototype." },
      { id: 4, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: 'Today 9:15 AM', text: "I can start on the API for custom folder ordering this sprint. Should be straightforward." },
    ],
  },

  /* ——— Meeting: Standup ——— */
  'meet-standup': {
    type: 'meeting', name: 'Standup',
    groupImg: '/icons/magic-quill.svg',
    avatars: ['/headshots/derek-cicerone.jpg', '/headshots/rob-figueiredo.jpg', '/headshots/keegan-lanzillotta.jpg'],
    memberCount: 8,
    timeline: {
      avatars: [
        { src: '/headshots/derek-cicerone.jpg', pos: 3 },
        { src: '/headshots/rob-figueiredo.jpg', pos: 10 },
        { src: '/headshots/keegan-lanzillotta.jpg', pos: 22 },
        { src: '/headshots/derek-cicerone.jpg', pos: 38 },
        { src: '/headshots/rob-figueiredo.jpg', pos: 50 },
        { src: '/headshots/keegan-lanzillotta.jpg', pos: 65 },
        { src: '/headshots/derek-cicerone.jpg', pos: 78 },
        { src: '/headshots/rob-figueiredo.jpg', pos: 90 },
      ],
    },
    messages: [
      { id: 1, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Today 10:00 AM', text: "Morning everyone. Let's do a quick round. What's everyone working on today?" },
      { id: 2, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: 'Today 10:02 AM', text: "Wrapping up the auth refactor. Should be ready for review by noon." },
      { id: 3, sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', time: 'Today 10:03 AM', text: "iOS push notifications fix is in QA. Starting on the chat performance ticket next." },
    ],
  },

  /* ——— DM: Grace Sutherland ——— */
  grace: {
    type: 'dm', name: 'Grace Sutherland', subtitle: 'Member of Roam HQ',
    avatar: '/headshots/grace-sutherland.jpg',
    messages: [
      { id: 1, self: false, text: "I wanted to chat about the new design and engineering project we've been assigned. Have you had a chance to review the initial requirements?", group: 'a' },
      { id: 2, self: false, text: "I went through the requirements this morning. It looks like the client wants a robust solution that combines both cutting-edge design and innovative engineering. What are your thoughts on the initial approach?", group: 'a' },
      { id: 3, self: true, text: "Hey, how's it going?" },
      { id: 'date', type: 'date', text: 'Wednesday, January 10' },
      { id: 4, self: false, text: "I wanted to chat about the new design and engineering project we've been assigned. Have you had a chance to review the initial requirements?", group: 'b' },
      { id: 5, self: false, text: "I went through the requirements this morning. It looks like the client wants a robust solution that combines both cutting-edge design and innovative engineering. What are your thoughts on the initial approach?", group: 'b' },
      { id: 6, self: true, text: "I think we should start with a strong concept phase. We need to align the design aesthetics with the engineering feasibility. Maybe we can brainstorm some ideas that balance both aspects? How about a meeting later today to start on that?" },
      { id: 7, self: false, text: "That sounds like a good plan. I was also thinking we should focus on modularity in our design. It would allow us to easily update or modify parts of the project if needed. What do you think?" },
      { id: 8, self: true, text: "That sounds like a good plan. I was also thinking we should focus on modularity in our design. It would allow us to easily update or modify parts of the project if needed. What do you think?" },
      { id: 9, type: 'wave', text: 'Grace waved at you' },
      { id: 10, self: false, text: "Absolutely. Modularity can offer a lot of flexibility. We should also consider the materials we use, ensuring they are both high-quality and cost-effective. Have you thought about any specific materials or technologies we should explore?" },
    ],
  },

  /* ——— DM: Rob Figueiredo ——— */
  rob: {
    type: 'dm', name: 'Rob Figueiredo', subtitle: 'Member of Roam HQ',
    avatar: '/headshots/rob-figueiredo.jpg',
    messages: [
      { id: 1, self: false, text: 'Can you review the PR when you get a chance?' },
      { id: 2, self: true, text: "Sure, I'll take a look this afternoon." },
    ],
  },

  /* ——— DM: Will (favorite) ——— */
  will: {
    type: 'dm', name: 'Will Hou', subtitle: 'Member of Roam HQ',
    avatar: '/headshots/will-hou.jpg',
    messages: [
      { id: 1, self: false, text: "What happened on the call before?" },
      { id: 2, self: true, text: "We discussed the new onboarding flow and timeline." },
    ],
  },

  /* ——— DM: Howard (favorite) ——— */
  'howard-fav': {
    type: 'dm', name: 'Howard Lerman', subtitle: 'CEO of Roam',
    avatar: '/headshots/howard-lerman.jpg',
    messages: [
      { id: 1, self: false, text: "Hey, did you get a chance to look at the new office layout?" },
      { id: 2, self: true, text: "Yeah it looks great! Love the open floor plan concept." },
    ],
  },
};

/* ———————————————————————————————————————
   Chevron SVG
——————————————————————————————————————— */
function ChevronDown({ open, className }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`ainbox-chevron ${open ? 'ainbox-chevron-open' : ''} ${className || ''}`}>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ———————————————————————————————————————
   GroupAvatar (overlapping faces)
——————————————————————————————————————— */
function GroupAvatar({ avatars, size = 24 }) {
  const overlap = size * 0.3;
  return (
    <div className="ainbox-group-avatar" style={{ width: size + (avatars.length - 1) * (size - overlap), height: size }}>
      {avatars.map((src, i) => (
        <img key={i} src={src} alt="" className="ainbox-group-avatar-img" style={{ width: size, height: size, left: i * (size - overlap), zIndex: avatars.length - i }} />
      ))}
    </div>
  );
}

/* ———————————————————————————————————————
   Thread indicator
——————————————————————————————————————— */
function ThreadIndicator({ thread, onClick }) {
  return (
    <div className="ainbox-thread-indicator" onClick={onClick}>
      <span className="ainbox-thread-count">{thread.count} replies</span>
      <span className="ainbox-thread-last">Last reply {thread.lastReply}</span>
    </div>
  );
}

/* ———————————————————————————————————————
   Reactions row (used in thread view)
——————————————————————————————————————— */
function Reactions({ reactions: initial }) {
  const [reactions, setReactions] = useState(initial);
  const toggle = (i) => {
    setReactions(prev => prev.map((r, j) => j !== i ? r : {
      ...r,
      active: !r.active,
      count: r.active ? r.count - 1 : r.count + 1,
    }));
  };
  return (
    <div className="ainbox-reactions">
      {reactions.map((r, i) => (
        <div key={i} className={`ainbox-reaction ${r.active ? 'ainbox-reaction-active' : ''}`} onClick={() => toggle(i)}>
          <span className="ainbox-reaction-emoji">{r.emoji}</span>
          <span className="ainbox-reaction-count">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

/* ———————————————————————————————————————
   Pinned items toolbar
——————————————————————————————————————— */
function PinnedToolbar({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="ainbox-pinned-toolbar">
      {items.map((item, i) => (
        <div key={i} className="ainbox-pinned-item">
          {item.avatar && <img src={item.avatar} alt="" className="ainbox-pinned-img" />}
          {item.emoji && <span className="ainbox-pinned-emoji">{item.emoji}</span>}
          <span className="ainbox-pinned-label">{item.label}</span>
        </div>
      ))}
      <div className="ainbox-pinned-more">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="3" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="13" cy="8" r="1" fill="currentColor"/></svg>
      </div>
    </div>
  );
}

/* ———————————————————————————————————————
   Meeting timeline
——————————————————————————————————————— */
function MeetingTimeline({ timeline }) {
  if (!timeline) return null;
  // Build the dot/tick ruler: groups of 4 dots separated by ticks
  const ticks = [];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 4; j++) {
      ticks.push(<div key={`d${i}-${j}`} className="ainbox-timeline-dot" />);
    }
    if (i < 9) ticks.push(<div key={`t${i}`} className="ainbox-timeline-tick" />);
  }
  return (
    <div className="ainbox-timeline">
      <div className="ainbox-timeline-ruler">{ticks}</div>
      <div className="ainbox-timeline-track">
        <div className="ainbox-timeline-line" />
        {timeline.avatars.map((a, i) => (
          <img key={i} src={a.src} alt="" className="ainbox-timeline-avatar" style={{ left: `${a.pos}%` }} />
        ))}
      </div>
    </div>
  );
}

/* ———————————————————————————————————————
   Typing indicator
——————————————————————————————————————— */
function TypingIndicator({ avatars }) {
  const [visible, setVisible] = useState(false);
  const [currentAvatars, setCurrentAvatars] = useState(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (avatars && avatars.length > 0 && avatars[0]) {
      setCurrentAvatars(avatars);
      setExiting(false);
      setVisible(true);
    } else if (visible) {
      setExiting(true);
      const t = setTimeout(() => {
        setVisible(false);
        setExiting(false);
        setCurrentAvatars(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [avatars]);

  if (!visible || !currentAvatars) return null;
  return (
    <div className={`ainbox-typing ${exiting ? 'ainbox-typing-exit' : ''}`}>
      {currentAvatars.slice(0, 3).filter(Boolean).map((src, i) => (
        <img key={i} src={src} alt="" className="ainbox-typing-face" />
      ))}
      <div className="ainbox-typing-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

/* ———————————————————————————————————————
   Group message row
——————————————————————————————————————— */
function GroupMessage({ msg, onThreadClick }) {
  return (
    <div className="ainbox-group-msg">
      <img className="ainbox-group-msg-avatar" src={msg.avatar} alt="" />
      <div className="ainbox-group-msg-body">
        <div className="ainbox-group-msg-header">
          <span className="ainbox-group-msg-name">{msg.sender}</span>
          <span className="ainbox-group-msg-time">{msg.time}</span>
        </div>
        <p className="ainbox-group-msg-text">{msg.text}</p>
        {msg.thread && <ThreadIndicator thread={msg.thread} onClick={() => onThreadClick && onThreadClick(msg)} />}
      </div>
    </div>
  );
}

/* ———————————————————————————————————————
   DM bubble message
——————————————————————————————————————— */
function DmMessage({ msg, isFirstInGroup, isLastInGroup }) {
  if (msg.type === 'date') {
    return (
      <div className="ainbox-dm-date">
        <div className="ainbox-dm-date-line" />
        <span className="ainbox-dm-date-text">{msg.text}</span>
        <div className="ainbox-dm-date-line" />
      </div>
    );
  }
  if (msg.type === 'wave') {
    return (
      <div className="ainbox-dm-wave">
        <span>{msg.text}</span>
        <span className="ainbox-dm-wave-icon">👋</span>
      </div>
    );
  }

  const radiusIncoming = isFirstInGroup
    ? '18px 18px 18px 4px'
    : '4px 18px 18px 4px';
  const radiusOutgoing = isFirstInGroup
    ? '20px 20px 4px 20px'
    : '20px 4px 4px 20px';

  return (
    <div className={`ainbox-dm-msg ${msg.self ? 'ainbox-dm-msg-self' : ''} ${!isFirstInGroup ? 'ainbox-dm-msg-consecutive' : ''}`}>
      <div
        className={`ainbox-dm-bubble ${msg.self ? 'ainbox-dm-bubble-self' : ''}`}
        style={{ borderRadius: msg.self ? radiusOutgoing : radiusIncoming }}
      >
        <p>{msg.text}</p>
      </div>
    </div>
  );
}

/* ———————————————————————————————————————
   Main AInbox component
——————————————————————————————————————— */
/* ———————————————————————————————————————
   Default reactions for thread original msg
——————————————————————————————————————— */
const THREAD_REACTIONS = [
  { emoji: '👍', count: 1 }, { emoji: '😂', count: 3 },
  { emoji: '🤪', count: 5, active: true }, { emoji: '😡', count: 12 }, { emoji: '🚀', count: 4 },
];

export default function AInbox({ win, onDrag }) {
  const [selectedChat, setSelectedChat] = useState('design');
  const [collapsedSections, setCollapsedSections] = useState({});
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState(CONVERSATIONS);
  const [closing, setClosing] = useState(false);
  // threadView: null or { chatId, messageId }
  const [threadView, setThreadView] = useState(null);
  const messagesRef = useRef(null);
  const shouldScroll = useRef(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  const toggleSection = (id) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openThread = (chatId, messageId) => {
    setThreadView({ chatId, messageId });
  };

  const closeThread = () => {
    setThreadView(null);
  };

  // Check if user is near bottom before auto-scrolling
  const isNearBottom = () => {
    if (!messagesRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    return scrollHeight - scrollTop - clientHeight < 80;
  };

  const hasRendered = useRef(false);

  useEffect(() => {
    if (!hasRendered.current) return; // skip initial render
    if (messagesRef.current && (shouldScroll.current || isNearBottom())) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
      shouldScroll.current = false;
    }
  }, [messages]);

  // Scroll to bottom instantly on chat change or initial render
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
    hasRendered.current = true;
  }, [selectedChat]);

  // Continuous auto-chat across all group conversations
  useEffect(() => {
    const AUTO_PEOPLE = {
      design: [
        { name: 'Will Houseberry', avatar: '/headshots/will-hou.jpg' },
        { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg' },
        { name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg' },
        { name: 'Klas Leino', avatar: '/headshots/klas-leino.jpg' },
        { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg' },
      ],
      engineering: [
        { name: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg' },
        { name: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg' },
        { name: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg' },
      ],
      product: [
        { name: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg' },
        { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg' },
        { name: 'Jon Brod', avatar: '/headshots/jon-brod.jpg' },
      ],
      'all-hands': [
        { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg' },
        { name: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg' },
      ],
      ios: [
        { name: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg' },
        { name: 'John Moffa', avatar: '/headshots/john-moffa.jpg' },
      ],
      android: [
        { name: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg' },
        { name: 'Michael Miller', avatar: '/headshots/michael-miller.jpg' },
      ],
    };
    const AUTO_MESSAGES = [
      "I just pushed the updated color tokens to the repo — can someone review?",
      "The new icon set is looking really sharp, nice work everyone.",
      "Quick note: the spacing on the card component needs a tweak before we ship.",
      "Anyone else seeing a rendering issue on the dashboard tiles?",
      "I'll have the prototype ready by end of day, just finishing up transitions.",
      "Just wrapped up the user testing session — lots of great feedback.",
      "Can we sync on the navigation changes? I have some ideas.",
      "The latest build is looking solid. Great work team!",
      "I've updated the Figma file with the new component variants.",
      "Let me know when you're free for a quick design review.",
      "The performance improvements are live — page load is 40% faster.",
      "Heads up: I'm refactoring the auth module this afternoon.",
      "New PR is up for the settings page redesign.",
      "The client loved the demo! They want to move forward.",
      "I'll write up the spec doc and share it by EOD.",
    ];
    const groupIds = Object.keys(AUTO_PEOPLE);
    let timers = [];

    const typing = {};

    function scheduleNext(chatId, delay) {
      const timer = setTimeout(() => {
        if (typing[chatId]) return; // already typing, skip
        const people = AUTO_PEOPLE[chatId];
        const person = people[Math.floor(Math.random() * people.length)];
        typing[chatId] = person;
        // Show typing indicator
        setMessages(prev => {
          const convo = prev[chatId];
          if (!convo) return prev;
          return { ...prev, [chatId]: { ...convo, typingAvatars: [person.avatar] } };
        });
        // Send message after typing delay
        const sendTimer = setTimeout(() => {
          const p = typing[chatId];
          typing[chatId] = null;
          setMessages(prev => {
            const convo = prev[chatId];
            if (!convo) return prev;
            const msg = {
              id: Date.now() + Math.random(),
              sender: p.name,
              avatar: p.avatar,
              time: 'Just now',
              text: AUTO_MESSAGES[Math.floor(Math.random() * AUTO_MESSAGES.length)],
            };
            return { ...prev, [chatId]: { ...convo, typingAvatars: null, messages: [...convo.messages, msg] } };
          });
          // Schedule the next person to start typing quickly
          scheduleNext(chatId, 1000 + Math.random() * 3000);
        }, 2000 + Math.random() * 3000);
        timers.push(sendTimer);
      }, delay);
      timers.push(timer);
    }

    // Stagger initial delays per group
    groupIds.forEach((id, i) => {
      scheduleNext(id, 4000 + i * 3000 + Math.random() * 5000);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const convo = messages[selectedChat];

  const dmTimers = useRef({});

  const DM_REPLIES = [
    "That sounds great, let me take a look!",
    "Got it, I'll get back to you shortly.",
    "Thanks for the heads up!",
    "Sure thing, let's sync on this later today.",
    "Absolutely, I'll send over the details.",
    "Haha nice! I'll check it out.",
    "Interesting — let me think about that and get back to you.",
    "On it! Give me a few minutes.",
    "Perfect, that works for me.",
    "Great idea, let's do it.",
  ];

  const sendMessage = () => {
    if (!inputText.trim() || !convo) return;
    const chatId = selectedChat;
    const newMsg = convo.type === 'group'
      ? { id: Date.now(), sender: 'You', avatar: '/headshots/joe-woodward.jpg', time: 'now', text: inputText.trim() }
      : { id: Date.now(), self: true, text: inputText.trim() };
    setMessages(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId], messages: [...prev[chatId].messages, newMsg] },
    }));
    setInputText('');
    shouldScroll.current = true;

    // DM auto-reply
    if (convo.type === 'dm') {
      // Clear any existing timer for this chat
      if (dmTimers.current[chatId]) clearTimeout(dmTimers.current[chatId]);

      // Show typing after a short pause
      const typingTimer = setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [chatId]: { ...prev[chatId], typingAvatars: [prev[chatId].avatar] },
        }));

        // Send reply after typing
        const replyTimer = setTimeout(() => {
          setMessages(prev => {
            const c = prev[chatId];
            if (!c) return prev;
            const reply = {
              id: Date.now() + Math.random(),
              self: false,
              text: DM_REPLIES[Math.floor(Math.random() * DM_REPLIES.length)],
            };
            return { ...prev, [chatId]: { ...c, typingAvatars: null, messages: [...c.messages, reply] } };
          });
        }, 1500 + Math.random() * 2500);
        dmTimers.current[chatId] = replyTimer;
      }, 800 + Math.random() * 1200);
      dmTimers.current[chatId] = typingTimer;
    }
  };

  // Group DM messages for consecutive same-sender bubbles
  const getDmGroups = (msgs) => {
    const result = [];
    for (let i = 0; i < msgs.length; i++) {
      const msg = msgs[i];
      const prev = msgs[i - 1];
      const isFirstInGroup = !prev || prev.type || prev.self !== msg.self || prev.group !== msg.group;
      const next = msgs[i + 1];
      const isLastInGroup = !next || next.type || next.self !== msg.self || next.group !== msg.group;
      result.push({ ...msg, isFirstInGroup, isLastInGroup });
    }
    return result;
  };

  return (
    <div
      className={`ainbox-window ${!win.isFocused ? 'ainbox-unfocused' : ''} ${closing ? 'ainbox-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      {/* ——— Title bar ——— */}
      <div className="ainbox-titlebar" onMouseDown={onDrag}>
        <div className="ainbox-traffic-lights">
          <div className="ainbox-light ainbox-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="ainbox-light ainbox-light-minimize" />
          <div className="ainbox-light ainbox-light-maximize" />
        </div>
        <div className="ainbox-search">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Search</span>
        </div>
      </div>

      {/* ——— Body ——— */}
      <div className="ainbox-body">

        {/* ——— Sidebar ——— */}
        <div className="ainbox-sidebar">
          {/* Sidebar header */}
          <div className="ainbox-sidebar-header">
            <div className="ainbox-sidebar-header-left">
              <span className="ainbox-sidebar-title">AInbox</span>
              <ChevronDown open={true} />
            </div>
            <img src="/icons/compose.svg" alt="" className="ainbox-compose-icon" />
          </div>

          {/* Scrollable sections */}
          <div className="ainbox-sections">
            {/* Favorites row */}
            <div className="ainbox-favorites">
              {FAVORITES.map(fav => (
                <div
                  key={fav.id}
                  className={`ainbox-fav-item ${selectedChat === fav.id ? 'ainbox-fav-active' : ''}`}
                  onClick={() => { setSelectedChat(fav.id); setThreadView(null); }}
                >
                  {fav.avatars ? (
                    <div className="ainbox-fav-group-avatar">
                      {fav.avatars.map((src, i) => (
                        <img key={i} src={src} alt="" className="ainbox-fav-group-img" style={{ zIndex: 2 - i }} />
                      ))}
                    </div>
                  ) : (
                    <img src={fav.avatar} alt="" className="ainbox-fav-avatar" />
                  )}
                  <span className="ainbox-fav-name">{fav.name}</span>
                </div>
              ))}
            </div>
            {SIDEBAR_SECTIONS.map(section => (
              <div key={section.id} className="ainbox-section">
                <div className="ainbox-section-header" onClick={() => toggleSection(section.id)}>
                  <ChevronDown open={!collapsedSections[section.id]} className="ainbox-section-chevron" />
                  <span className="ainbox-section-label">{section.label}</span>
                </div>
                {!collapsedSections[section.id] && (
                  <div className="ainbox-section-items">
                    {section.items.map(item => (
                      <div
                        key={item.id}
                        className={`ainbox-section-item ${selectedChat === item.id ? 'ainbox-section-item-active' : ''}`}
                        onClick={() => {
                          if (item.threadRef) {
                            setSelectedChat(item.threadRef.chatId);
                            openThread(item.threadRef.chatId, item.threadRef.messageId);
                          } else if (CONVERSATIONS[item.id]) {
                            setSelectedChat(item.id);
                            setThreadView(null);
                          }
                        }}
                      >
                        {item.groupImg ? (
                          <img src={item.groupImg} alt="" className="ainbox-section-item-avatar" />
                        ) : item.avatar ? (
                          <div className="ainbox-section-item-avatar-wrap">
                            <img src={item.avatar} alt="" className="ainbox-section-item-avatar" />
                            {item.online && <div className="ainbox-online-dot" />}
                          </div>
                        ) : (
                          <div className={`ainbox-section-item-icon ${(item.type === 'meeting' || item.type === 'thread') ? 'ainbox-section-item-icon-circle' : ''}`}>
                            {item.type === 'meeting' && (
                              <img src="/icons/magic-quill.svg" alt="" className="ainbox-section-item-icon-img" />
                            )}
                            {item.type === 'thread' && (
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4H13M3 8H10M3 12H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                            )}
                          </div>
                        )}
                        <span className="ainbox-section-item-name">{item.name}</span>
                      </div>
                    ))}
                    {section.id === 'groups' && (
                      <div className="ainbox-section-item ainbox-section-item-add">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        <span className="ainbox-section-item-name">Add Group</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {/* Add Folder */}
            <div className="ainbox-section-item ainbox-add-folder">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span className="ainbox-section-item-name">Add Folder</span>
            </div>
          </div>
        </div>

        {/* ——— Detail pane ——— */}
        <div className="ainbox-detail">
          {/* ——— Thread view ——— */}
          {threadView && (() => {
            const threadConvo = messages[threadView.chatId];
            const threadMsg = threadConvo?.messages.find(m => m.id === threadView.messageId);
            if (!threadConvo || !threadMsg || !threadMsg.thread) return null;
            return (
              <>
                {/* Thread header: breadcrumb */}
                <div className="ainbox-detail-header">
                  <div className="ainbox-detail-header-left">
                    {threadConvo.type === 'meeting' ? (
                      <div className="ainbox-detail-header-meeting-icon">
                        <img src={threadConvo.groupImg} alt="" className="ainbox-section-item-icon-img" />
                      </div>
                    ) : (
                      <img src={threadConvo.groupImg || threadConvo.avatars[0]} alt="" className="ainbox-detail-header-avatar" />
                    )}
                    <div className="ainbox-thread-breadcrumb">
                      <span className="ainbox-breadcrumb-group" onClick={closeThread}>{threadConvo.name}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ainbox-breadcrumb-chevron">
                        <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="ainbox-breadcrumb-current">Replies</span>
                    </div>
                  </div>
                  <div className="ainbox-detail-header-actions">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="13" r="1" fill="currentColor"/></svg>
                  </div>
                </div>
                {/* Thread conversation */}
                <div className="ainbox-detail-messages ainbox-thread-messages" ref={messagesRef}>
                  {/* Original message */}
                  <div className="ainbox-thread-original">
                    <div className="ainbox-thread-original-top">
                      <img src={threadMsg.avatar} alt="" className="ainbox-group-msg-avatar" />
                      <div className="ainbox-thread-original-info">
                        <span className="ainbox-thread-original-name">{threadMsg.sender}</span>
                        <span className="ainbox-thread-original-time">{threadMsg.time}</span>
                      </div>
                    </div>
                    <p className="ainbox-thread-original-text">{threadMsg.text}</p>
                    <Reactions reactions={THREAD_REACTIONS} />
                  </div>
                  {/* Replies */}
                  {threadMsg.thread.replies.map(reply => (
                    <div key={reply.id} className="ainbox-group-msg">
                      <img className="ainbox-group-msg-avatar" src={reply.avatar} alt="" />
                      <div className="ainbox-group-msg-body">
                        <div className="ainbox-group-msg-header">
                          <span className="ainbox-group-msg-name">{reply.sender}</span>
                        </div>
                        <p className="ainbox-group-msg-text">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          {/* ——— Group view ——— */}
          {!threadView && convo && (convo.type === 'group' || convo.type === 'meeting') && (
            <>
              {/* Group header */}
              <div className="ainbox-detail-header">
                <div className="ainbox-detail-header-left">
                  {convo.type === 'meeting' ? (
                    <div className="ainbox-detail-header-meeting-icon">
                      <img src={convo.groupImg} alt="" className="ainbox-section-item-icon-img" />
                    </div>
                  ) : (
                    <img src={convo.groupImg || convo.avatars[0]} alt="" className="ainbox-detail-header-avatar" />
                  )}
                  <span className="ainbox-detail-header-name">{convo.name}</span>
                </div>
                <div className="ainbox-detail-header-right">
                  {/* Facepile */}
                  <div className="ainbox-facepile">
                    <div className="ainbox-facepile-faces">
                      {convo.avatars.slice(0, 3).map((src, i) => (
                        <img key={i} src={src} alt="" className="ainbox-facepile-img" />
                      ))}
                    </div>
                    <div className="ainbox-facepile-count">
                      <span>{convo.memberCount}</span>
                    </div>
                    <div className="ainbox-facepile-add">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                  <div className="ainbox-detail-header-actions">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="13" r="1" fill="currentColor"/></svg>
                  </div>
                </div>
              </div>
              {/* Pinned toolbar */}
              {convo.pinnedItems && <PinnedToolbar items={convo.pinnedItems} />}
              {/* Meeting timeline */}
              {convo.timeline && <MeetingTimeline timeline={convo.timeline} />}
              {/* Group messages */}
              <div className="ainbox-detail-messages ainbox-group-messages" ref={messagesRef}>
                {convo.messages.map(msg => (
                  <GroupMessage key={msg.id} msg={msg} onThreadClick={(m) => openThread(selectedChat, m.id)} />
                ))}
              </div>
            </>
          )}

          {/* ——— DM view ——— */}
          {!threadView && convo && convo.type === 'dm' && (
            <>
              {/* DM header */}
              <div className="ainbox-detail-header">
                <div className="ainbox-detail-header-left">
                  <img src={convo.avatar} alt="" className="ainbox-detail-header-avatar" />
                  <span className="ainbox-detail-header-name">{convo.name}</span>
                  {convo.subtitle && <span className="ainbox-detail-header-subtitle">{convo.subtitle}</span>}
                </div>
                <div className="ainbox-detail-header-actions">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="13" r="1" fill="currentColor"/></svg>
                </div>
              </div>
              {/* DM messages */}
              <div className="ainbox-detail-messages ainbox-dm-messages" ref={messagesRef}>
                {getDmGroups(convo.messages).map(msg => (
                  <DmMessage key={msg.id} msg={msg} isFirstInGroup={msg.isFirstInGroup} isLastInGroup={msg.isLastInGroup} />
                ))}
              </div>
            </>
          )}

          {/* Composer */}
          <div className="ainbox-composer">
            {convo?.typingAvatars && (
              <TypingIndicator avatars={convo.typingAvatars} />
            )}
            <div className="ainbox-composer-box">
              <div className="ainbox-composer-field">
                <input
                  placeholder="Write a Message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                />
              </div>
              <div className="ainbox-composer-toolbar">
                {/* Plus button */}
                <div className="ainbox-toolbar-plus">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                {/* Formatting icons */}
                <div className="ainbox-toolbar-group">
                  <img src="/icons/composer/Bold.svg" alt="" className="ainbox-toolbar-img" title="Bold" />
                  <img src="/icons/composer/Italic.svg" alt="" className="ainbox-toolbar-img" title="Italic" />
                  <img src="/icons/composer/Strikethrough.svg" alt="" className="ainbox-toolbar-img" title="Strikethrough" />
                  <img src="/icons/composer/Code Inline.svg" alt="" className="ainbox-toolbar-img" title="Code" />
                </div>
                <div className="ainbox-toolbar-divider" />
                <div className="ainbox-toolbar-group">
                  <img src="/icons/composer/Number List.svg" alt="" className="ainbox-toolbar-img" title="Numbered list" />
                  <img src="/icons/composer/Bullet List.svg" alt="" className="ainbox-toolbar-img" title="Bullet list" />
                  <img src="/icons/composer/Checklist.svg" alt="" className="ainbox-toolbar-img" title="Checklist" />
                  <img src="/icons/composer/Blockquotes.svg" alt="" className="ainbox-toolbar-img" title="Quote" />
                </div>
                <div className="ainbox-toolbar-divider" />
                <div className="ainbox-toolbar-group">
                  <img src="/icons/composer/Link.svg" alt="" className="ainbox-toolbar-img" title="Link" />
                </div>
                {/* Spacer */}
                <div className="ainbox-toolbar-spacer" />
                {/* Right icons */}
                <div className="ainbox-toolbar-group">
                  <img src="/icons/composer/Send.svg" alt="" className={`ainbox-toolbar-img ainbox-send-icon ${inputText.trim() ? 'ainbox-send-active' : ''}`} title="Send" onClick={sendMessage} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarIcon({ d, title }) {
  return (
    <div className="ainbox-toolbar-icon" title={title}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d={d} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
