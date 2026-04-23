import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
// data.js imports removed — floor data is self-contained
import SiriGlow from './SiriGlow';
import Navbar from './Navbar';
import AInbox from './AInbox';
import MiniChat, { getChatIdForAvatar } from './MiniChat';
import OnAir from './OnAir';
import MeetingWindow from './MeetingWindow';
import TheaterWindow from './TheaterWindow';
import OnItTaskPane from './OnItTaskPane';
import MagicMinutes from './MagicMinutes';
import Recordings from './Recordings';
import Lobby from './Lobby';
import MobileWindow from './MobileWindow';
import { ChatProvider, useChat } from './ChatContext';
import { WindowManagerProvider, useWindow } from './WindowManager';
import StoryViewer from './StoryViewer';
import ShareDialog from './ShareDialog';
import Footer from './Footer';
import './ShowcaseMap.css';

// Flip to `false` to show the nav, bottom bar, and theme toggle
const HIDE_CHROME = false;

const CLAUDE = '#EB6139';
const CODEX = '#0000FF';

// Real names from headshot filenames
const SHOWCASE_PEOPLE = [
  { name: 'Joe W.', fullName: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg' },
  { name: 'Derek C.', avatar: '/headshots/derek-cicerone.jpg' },
  { name: 'John M.', avatar: '/headshots/john-moffa.jpg' },
  { name: 'Jon B.', avatar: '/headshots/jon-brod.jpg' },
  { name: 'Keegan L.', avatar: '/headshots/keegan-lanzillotta.jpg' },
  { name: 'Grace S.', avatar: '/headshots/grace-sutherland.jpg' },
  { name: 'Michael W.', avatar: '/headshots/michael-walrath.jpg' },
  { name: 'Rob F.', avatar: '/headshots/rob-figueiredo.jpg' },
  { name: 'Chelsea T.', fullName: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg' },
  { name: 'Lexi B.', avatar: '/headshots/lexi-bohonnon.jpg' },
  { name: 'Will H.', avatar: '/headshots/will-hou.jpg' },
  { name: 'Howard L.', fullName: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg' },
  { name: 'Jeff G.', avatar: '/headshots/jeff-grossman.jpg' },
  { name: 'Peter L.', fullName: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg' },
  { name: 'Sean M.', fullName: 'Sean MacIsaac', avatar: '/headshots/sean-macisaac.jpg' },
  { name: 'Arnav B.', avatar: '/headshots/arnav-bansal.jpg' },
  { name: 'Aaron W.', avatar: '/headshots/aaron-wadhwa.jpg' },
  { name: 'Thomas G.', avatar: '/headshots/thomas-grapperon.jpg' },
  { name: 'Tom D.', avatar: '/headshots/tom-dixon.jpg' },
  { name: 'John H.', avatar: '/headshots/john-huffsmith.jpg' },
  { name: 'Mattias L.', avatar: '/headshots/mattias-leino.jpg' },
  { name: 'Klas L.', avatar: '/headshots/klas-leino.jpg' },
  { name: 'John B.', avatar: '/headshots/john-beutner.jpg' },
  { name: 'Michael M.', avatar: '/headshots/michael-miller.jpg' },
  { name: 'Garima K.', avatar: '/headshots/garima-kewlani.jpg' },
  { name: 'Ava L.', fullName: 'Ava Lee', avatar: '/headshots/ava-lee.jpg' },
  // Video-talent roster — avatars + video clips for live/recorded streams
  { name: 'Ashley B.', fullName: 'Ashley Brooks', avatar: '/videos/Female/ashley_brooks.png', video: '/videos/Female/ashley_brooks.mp4', gender: 'female' },
  { name: 'Brooke F.', fullName: 'Brooke Foster', avatar: '/videos/Female/brooke_foster.png', video: '/videos/Female/brooke_foster.mp4', gender: 'female' },
  { name: 'Camila T.', fullName: 'Camila Torres', avatar: '/videos/Female/camila_torres.png', video: '/videos/Female/camila_torres.mp4', gender: 'female' },
  { name: 'Chloe P.', fullName: 'Chloe Peterson', avatar: '/videos/Female/chloe_peterson.png', video: '/videos/Female/chloe_peterson.mp4', gender: 'female' },
  { name: 'Emily C.', fullName: 'Emily Carter', avatar: '/videos/Female/emily_carter.png', video: '/videos/Female/emily_carter.mp4', gender: 'female' },
  { name: 'Grace T.', fullName: 'Grace Thompson', avatar: '/videos/Female/grace_thompson.png', video: '/videos/Female/grace_thompson.mp4', gender: 'female' },
  { name: 'Hannah B.', fullName: 'Hannah Bennett', avatar: '/videos/Female/hannah_bennett.png', video: '/videos/Female/hannah_bennett.mp4', gender: 'female' },
  { name: 'Isabella M.', fullName: 'Isabella Morgan', avatar: '/videos/Female/isabella_morgan.png', video: '/videos/Female/isabella_morgan.mp4', gender: 'female' },
  { name: 'Jessica H.', fullName: 'Jessica Hall', avatar: '/videos/Female/jessica_hall.png', video: '/videos/Female/jessica_hall.mp4', gender: 'female' },
  { name: 'Lauren H.', fullName: 'Lauren Hayes', avatar: '/videos/Female/lauren_hayes.png', video: '/videos/Female/lauren_hayes.mp4', gender: 'female' },
  { name: 'Madison R.', fullName: 'Madison Reed', avatar: '/videos/Female/madison_reed.png', video: '/videos/Female/madison_reed.mp4', gender: 'female' },
  { name: 'Megan T.', fullName: 'Megan Taylor', avatar: '/videos/Female/megan_taylor.png', video: '/videos/Female/megan_taylor.mp4', gender: 'female' },
  { name: 'Mia C.', fullName: 'Mia Chen', avatar: '/videos/Female/mia_chen.png', video: '/videos/Female/mia_chen.mp4', gender: 'female' },
  { name: 'Natalie W.', fullName: 'Natalie Wilson', avatar: '/videos/Female/natalie_wilson.png', video: '/videos/Female/natalie_wilson.mp4', gender: 'female' },
  { name: 'Olivia S.', fullName: 'Olivia Sanders', avatar: '/videos/Female/olivia_sanders.png', video: '/videos/Female/olivia_sanders.mp4', gender: 'female' },
  { name: 'Rachel C.', fullName: 'Rachel Cooper', avatar: '/videos/Female/rachel_cooper.png', video: '/videos/Female/rachel_cooper.mp4', gender: 'female' },
  { name: 'Sarah M.', fullName: 'Sarah Mitchell', avatar: '/videos/Female/sarah_mitchell.png', video: '/videos/Female/sarah_mitchell.mp4', gender: 'female' },
  { name: 'Sophia R.', fullName: 'Sophia Ramirez', avatar: '/videos/Female/sophia_ramirez.png', video: '/videos/Female/sophia_ramirez.mp4', gender: 'female' },
  { name: 'Daniel R.', fullName: 'Daniel Russell', avatar: '/videos/Male/daniel_russell.png', video: '/videos/Male/daniel_russell.mp4', gender: 'male' },
  { name: 'Ethan B.', fullName: 'Ethan Bishop', avatar: '/videos/Male/ethan_bishop.png', video: '/videos/Male/ethan_bishop.mp4', gender: 'male' },
  { name: 'Michael S.', fullName: 'Michael Stevens', avatar: '/videos/Male/michael_stevens.png', video: '/videos/Male/michael_stevens.mp4', gender: 'male' },
];

const p = (name) => SHOWCASE_PEOPLE.find(p => p.name === name) || SHOWCASE_PEOPLE[0];

// Floor layouts — each floor has its own rooms
export const FLOORS = {
  'R&D': [
    { id: 'r1', type: 'private', name: 'Klas L.', people: [], pos: { col: 0, row: 0 }, span: 1 },
    { id: 'r2', type: 'private', name: 'Derek C.', people: [p('Derek C.'), p('Michael M.')], pos: { col: 1, row: 0 }, span: 1 },
    { id: 'r3', type: 'private', name: 'John M.', people: [p('John M.')], pos: { col: 2, row: 0 }, span: 1 },
    { id: 'r4', type: 'private', name: 'Howard L.', people: [p('Howard L.')], pos: { col: 3, row: 0 }, span: 1, story: '/stories/story-howard.mp4' },
    { id: 'r5', type: 'private', name: 'Keegan L.', people: [p('Keegan L.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'r5b', type: 'private', name: 'Jon B.', people: [p('Jon B.')], pos: { col: 5, row: 0 }, span: 1, spotify: { song: 'Some Might Say', artist: 'Oasis', art: '/spotify/oasis-some-might-say.png' } },
    { id: 'r6', type: 'private', name: 'Grace S.', people: [p('Grace S.')], pos: { col: 0, row: 1 }, span: 1 },
    { id: 'r7', type: 'private', name: 'Michael W.', people: [p('Michael W.')], pos: { col: 1, row: 1 }, span: 1, figma: { comment: 'Can we tighten the 24px gap to 16px?', file: 'Dock v3', author: 'Ava L.' } },
    { id: 'theater', type: 'theater', name: 'Theater', people: [], pos: { col: 2, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'r8', type: 'private', name: 'Rob F.', people: [p('Rob F.')], pos: { col: 4, row: 1 }, span: 1 },
    { id: 'r8b', type: 'private', name: 'Chelsea T.', people: [p('Chelsea T.')], pos: { col: 5, row: 1 }, span: 1 },
    { id: 'r12', type: 'private', name: 'Jeff G.', people: [p('Jeff G.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'r13', type: 'private', name: 'Peter L.', people: [p('Peter L.')], pos: { col: 1, row: 2 }, span: 1 },
    { id: 'r14', type: 'private', name: 'Sean M.', people: [p('Sean M.')], pos: { col: 4, row: 2 }, span: 1 },
    { id: 'r14b', type: 'private', name: 'Joe W.', people: [p('Joe W.')], pos: { col: 5, row: 2 }, span: 1, github: { repo: 'roam/app', number: 4836, title: 'Feature page: cards + split section polish', branch: 'joe/feature-page-polish' } },
    { id: 'r15', type: 'private', name: 'Aaron W.', people: [p('Aaron W.')], pos: { col: 0, row: 3 }, span: 1 },
    { id: 'r16', type: 'game', name: 'Game Room', people: [], pos: { col: 1, row: 3 }, span: 1 },
    { id: 'alan-kay', type: 'meeting', name: 'Meeting Room', people: [p('Grace S.'), p('Chelsea T.'), p('Lexi B.'), p('Ashley B.'), p('Hannah B.'), p('Daniel R.')], pos: { col: 2, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 'standup', type: 'meeting', name: 'Daily Standup', people: [p('Lexi B.'), p('Grace S.'), p('Chelsea T.'), p('Garima K.'), p('Ava L.'), p('Mia C.'), p('Sarah M.'), p('Ethan B.')], pos: { col: 4, row: 3 }, colSpan: 2, rowSpan: 2 },
  ],
  'Commercial': [
    // Large lobby spanning top-left
    { id: 'c-lobby', type: 'meeting', name: 'Sales Floor', people: [p('Lexi B.'), p('Will H.'), p('Peter L.'), p('Sean M.'), p('Chelsea T.'), p('Garima K.'), p('Joe W.'), p('Brooke F.'), p('Camila T.'), p('Isabella M.'), p('Michael S.')], pos: { col: 0, row: 0 }, colSpan: 3, rowSpan: 2 },
    { id: 'c1', type: 'private', name: 'Arnav B.', people: [p('Arnav B.')], pos: { col: 3, row: 0 }, span: 1, story: '/stories/story-3.jpg' },
    { id: 'c2', type: 'private', name: 'Aaron W.', people: [p('Aaron W.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'c3', type: 'private', name: 'Tom D.', people: [], pos: { col: 5, row: 0 }, span: 1 },
    // Row 2 — right side offices
    { id: 'c4', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 3, row: 1 }, span: 1 },
    { id: 'c5', type: 'private', name: 'John B.', people: [p('John B.'), p('Thomas G.')], pos: { col: 4, row: 1 }, span: 1 },
    { id: 'c6', type: 'private', name: 'Mattias L.', people: [p('Mattias L.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 3 — sparse with gap
    { id: 'c7', type: 'private', name: 'Jeff G.', people: [p('Jeff G.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'c8', type: 'private', name: 'Howard L.', people: [], pos: { col: 1, row: 2 }, span: 1 },
    { id: 'c9', type: 'game', name: 'Game Room', people: [], pos: { col: 4, row: 2 }, colSpan: 2, rowSpan: 1 },
    // Row 4 — theater and offices
    { id: 'c10', type: 'private', name: 'Rob F.', people: [p('Rob F.')], pos: { col: 0, row: 3 }, span: 1 },
    { id: 'c11', type: 'theater', name: 'Theater', people: [], pos: { col: 1, row: 3 }, colSpan: 3, rowSpan: 2 },
    { id: 'c12', type: 'private', name: 'Derek C.', people: [p('Derek C.')], pos: { col: 4, row: 3 }, span: 1 },
    { id: 'c13', type: 'private', name: 'Michael M.', people: [p('Michael M.')], pos: { col: 5, row: 3 }, span: 1 },
  ],
  'Marketing': [
    // Row 1 — offices with a gap in the middle
    { id: 'm1', type: 'private', name: 'Grace S.', people: [p('Grace S.')], pos: { col: 0, row: 0 }, span: 1 },
    { id: 'm2', type: 'private', name: 'Chelsea T.', people: [p('Chelsea T.')], pos: { col: 1, row: 0 }, span: 1, story: '/stories/story-2.png' },
    { id: 'm3', type: 'private', name: 'Keegan L.', people: [p('Keegan L.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'm4', type: 'private', name: 'John M.', people: [p('John M.')], pos: { col: 5, row: 0 }, span: 1 },
    // Row 2 — meeting room in the center
    { id: 'm5', type: 'private', name: 'Lexi B.', people: [p('Lexi B.')], pos: { col: 0, row: 1 }, span: 1, story: '/stories/story-4.jpg' },
    { id: 'm-brand', type: 'meeting', name: 'Brand Review', people: [p('Ava L.'), p('Derek C.'), p('Arnav B.'), p('Aaron W.'), p('Chloe P.'), p('Emily C.'), p('Grace T.'), p('Jessica H.')], pos: { col: 1, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'm-content', type: 'meeting', name: 'Content Sync', people: [p('Rob F.'), p('Joe W.'), p('Lauren H.'), p('Madison R.'), p('Megan T.'), p('Natalie W.')], pos: { col: 3, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'm6', type: 'private', name: 'Mattias L.', people: [p('Mattias L.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 3 — sparse
    { id: 'm7', type: 'private', name: 'Will H.', people: [p('Will H.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'm8', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 5, row: 2 }, span: 1 },
    // Row 4 — theater + game + offices
    { id: 'm9', type: 'theater', name: 'Theater', people: [], pos: { col: 0, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 'm10', type: 'private', name: 'Peter L.', people: [p('Peter L.')], pos: { col: 2, row: 3 }, span: 1 },
    { id: 'm11', type: 'private', name: 'Tom D.', people: [], pos: { col: 3, row: 3 }, span: 1 },
    { id: 'm12', type: 'game', name: 'Game Room', people: [], pos: { col: 4, row: 3 }, span: 1 },
    { id: 'm13', type: 'private', name: 'Sean M.', people: [p('Sean M.')], pos: { col: 5, row: 3 }, span: 1 },
    // Row 5
    { id: 'm14', type: 'private', name: 'Michael M.', people: [p('Michael M.')], pos: { col: 2, row: 4 }, span: 1 },
    { id: 'm15', type: 'private', name: 'Thomas G.', people: [p('Thomas G.')], pos: { col: 3, row: 4 }, span: 1 },
    { id: 'm16', type: 'private', name: 'Jon B.', people: [p('Jon B.')], pos: { col: 4, row: 4 }, span: 1 },
    { id: 'm17', type: 'private', name: 'John H.', people: [p('John H.')], pos: { col: 5, row: 4 }, span: 1 },
  ],
  'Executive': [
    // Large boardroom center
    { id: 'e-board', type: 'meeting', name: 'Boardroom', people: [p('Keegan L.'), p('Thomas G.'), p('Klas L.'), p('Will H.'), p('Arnav B.'), p('Olivia S.'), p('Rachel C.'), p('Sophia R.')], pos: { col: 1, row: 0 }, colSpan: 4, rowSpan: 2 },
    { id: 'e1', type: 'private', name: 'Howard L.', people: [], pos: { col: 0, row: 0 }, span: 1 },
    { id: 'e2', type: 'private', name: 'Joe W.', people: [p('Joe W.')], pos: { col: 5, row: 0 }, span: 1 },
    { id: 'e3', type: 'private', name: 'Peter L.', people: [p('Peter L.')], pos: { col: 0, row: 1 }, span: 1 },
    { id: 'e4', type: 'private', name: 'Jon B.', people: [p('Jon B.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 3 — sparse executive offices
    { id: 'e5', type: 'private', name: 'Derek C.', people: [p('Derek C.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'e6', type: 'private', name: 'Rob F.', people: [p('Rob F.')], pos: { col: 2, row: 2 }, span: 1 },
    { id: 'e7', type: 'private', name: 'Jeff G.', people: [p('Jeff G.')], pos: { col: 4, row: 2 }, span: 1 },
    // Row 4 — lounge
    { id: 'e-lounge', type: 'game', name: 'Executive Lounge', people: [], pos: { col: 0, row: 3 }, colSpan: 3, rowSpan: 2 },
    { id: 'e8', type: 'private', name: 'Grace S.', people: [p('Grace S.')], pos: { col: 3, row: 3 }, span: 1 },
    { id: 'e9', type: 'private', name: 'Chelsea T.', people: [p('Chelsea T.')], pos: { col: 4, row: 3 }, span: 1 },
    { id: 'e10', type: 'theater', name: 'Theater', people: [], pos: { col: 5, row: 3 }, rowSpan: 2 },
  ],
  'Homepage': [
    { id: 'hp1', type: 'private', name: 'Arnav B.', people: [p('Arnav B.')], pos: { col: 0, row: 0 }, span: 1, story: '/stories/story-3.jpg' },
    { id: 'hp-huddle', type: 'meeting', name: 'Design Huddle', people: [p('Derek C.'), p('Michael W.'), p('Keegan L.'), p('Jon B.'), p('Jeff G.'), p('Will H.'), p('John M.'), p('Michael M.'), p('Hannah B.'), p('Isabella M.'), p('Mia C.'), p('Natalie W.'), p('Rachel C.')], pos: { col: 1, row: 0 }, colSpan: 2, rowSpan: 1 },
    { id: 'hp2', type: 'private', name: 'Klas L.', people: [p('Klas L.'), p('Chelsea T.')], pos: { col: 3, row: 0 }, span: 1 },
    { id: 'hp3', type: 'private', name: 'Tom D.', people: [], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'hp4', type: 'private', name: 'Thomas G.', people: [p('Thomas G.')], pos: { col: 5, row: 0 }, span: 1 },
    { id: 'hp5', type: 'private', name: 'Mattias L.', people: [p('Mattias L.')], pos: { col: 0, row: 1 }, span: 1, github: { repo: 'roam/app', number: 4830, title: 'Evals harness: parallel runs + retries', branch: 'mattias/evals-parallel' } },
    { id: 'hp6', type: 'private', name: 'John H.', people: [p('John H.')], pos: { col: 1, row: 1 }, span: 1, spotify: { song: 'Redbone', artist: 'Childish Gambino', art: '/spotify/childish-gambino-redbone.png' } },
    { id: 'hp-pods', type: 'meeting', name: 'Engineering Pods', people: [p('Emily C.'), p('Daniel R.'), p('Ethan B.'), p('Michael S.'), p('Sophia R.')], pos: { col: 2, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'hp7', type: 'private', name: 'Howard L.', people: [p('Howard L.')], pos: { col: 4, row: 1 }, span: 1 },
    { id: 'hp8', type: 'private', name: 'John B.', people: [p('John B.')], pos: { col: 5, row: 1 }, span: 1, story: '/stories/story-1.png' },
    { id: 'hp9', type: 'private', name: 'Lauren H.', people: [p('Lauren H.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'hp10', type: 'private', name: 'Jessica H.', people: [p('Jessica H.'), p('Grace T.')], pos: { col: 1, row: 2 }, span: 1 },
    { id: 'hp11', type: 'private', name: 'Ava L.', people: [p('Ava L.')], pos: { col: 4, row: 2 }, span: 1, story: '/stories/story-2.png' },
    { id: 'hp12', type: 'private', name: 'Garima K.', people: [p('Garima K.'), p('Chloe P.')], pos: { col: 5, row: 2 }, span: 1 },
    { id: 'hp-theater', type: 'theater', name: 'Theater', people: [], pos: { col: 0, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 'hp13', type: 'private', name: 'Peter L.', people: [p('Peter L.'), p('Grace S.')], pos: { col: 2, row: 3 }, span: 1 },
    { id: 'hp14', type: 'private', name: 'Sean M.', people: [p('Sean M.')], pos: { col: 3, row: 3 }, span: 1, story: '/stories/story-4.jpg' },
    { id: 'hp-demo', type: 'meeting', name: 'Demo Day', people: [p('Joe W.'), p('Lexi B.'), p('Ashley B.'), p('Brooke F.'), p('Olivia S.'), p('Sarah M.')], pos: { col: 4, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 'hp15', type: 'private', name: 'Aaron W.', people: [p('Aaron W.'), p('Madison R.')], pos: { col: 2, row: 4 }, span: 1 },
    { id: 'hp16', type: 'private', name: 'Rob F.', people: [p('Rob F.')], pos: { col: 3, row: 4 }, span: 1 },
  ],
  'DropIn': [
    // Row 0 — leadership row
    { id: 'di1', type: 'private', name: 'Howard L.', people: [p('Howard L.')], pos: { col: 0, row: 0 }, span: 1 },
    { id: 'di2', type: 'private', name: 'Jon B.', people: [p('Jon B.')], pos: { col: 1, row: 0 }, span: 1 },
    { id: 'di3', type: 'private', name: 'Derek C.', people: [p('Derek C.')], pos: { col: 2, row: 0 }, span: 1 },
    { id: 'di4', type: 'private', name: 'Keegan L.', people: [p('Keegan L.')], pos: { col: 3, row: 0 }, span: 1 },
    { id: 'di5', type: 'private', name: 'Michael W.', people: [p('Michael W.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'di6', type: 'private', name: 'Will H.', people: [p('Will H.')], pos: { col: 5, row: 0 }, span: 1 },
    // Row 1
    { id: 'di7', type: 'private', name: 'Joe W.', people: [p('Joe W.')], pos: { col: 0, row: 1 }, span: 1 },
    { id: 'di8', type: 'private', name: 'Chelsea T.', people: [p('Chelsea T.')], pos: { col: 1, row: 1 }, span: 1 },
    { id: 'di9', type: 'private', name: 'Grace S.', people: [p('Grace S.')], pos: { col: 2, row: 1 }, span: 1 },
    { id: 'di10', type: 'private', name: 'Lexi B.', people: [p('Lexi B.')], pos: { col: 3, row: 1 }, span: 1 },
    { id: 'di11', type: 'private', name: 'John M.', people: [p('John M.')], pos: { col: 4, row: 1 }, span: 1 },
    { id: 'di12', type: 'private', name: 'Jeff G.', people: [p('Jeff G.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 2 — café + 4 offices
    { id: 'di-cafe', type: 'game', name: 'Café', people: [p('Ashley B.'), p('Brooke F.')], pos: { col: 0, row: 2 }, colSpan: 2, rowSpan: 2 },
    { id: 'di13', type: 'private', name: 'Olivia S.', people: [p('Olivia S.')], pos: { col: 2, row: 2 }, span: 1 },
    { id: 'di14', type: 'private', name: 'Ethan B.', people: [p('Ethan B.')], pos: { col: 3, row: 2 }, span: 1 },
    { id: 'di15', type: 'private', name: 'Sarah M.', people: [p('Sarah M.')], pos: { col: 4, row: 2 }, span: 1 },
    { id: 'di16', type: 'private', name: 'Daniel R.', people: [p('Daniel R.')], pos: { col: 5, row: 2 }, span: 1 },
    // Row 3
    { id: 'di17', type: 'private', name: 'Sophia R.', people: [p('Sophia R.')], pos: { col: 2, row: 3 }, span: 1 },
    { id: 'di18', type: 'private', name: 'Hannah B.', people: [p('Hannah B.')], pos: { col: 3, row: 3 }, span: 1 },
    { id: 'di19', type: 'private', name: 'Mia C.', people: [p('Mia C.')], pos: { col: 4, row: 3 }, span: 1 },
    { id: 'di20', type: 'private', name: 'Camila T.', people: [p('Camila T.')], pos: { col: 5, row: 3 }, span: 1 },
    // Row 4
    { id: 'di21', type: 'private', name: 'Isabella M.', people: [p('Isabella M.')], pos: { col: 0, row: 4 }, span: 1 },
    { id: 'di22', type: 'private', name: 'Natalie W.', people: [p('Natalie W.')], pos: { col: 1, row: 4 }, span: 1 },
    { id: 'di23', type: 'private', name: 'Megan T.', people: [p('Megan T.')], pos: { col: 2, row: 4 }, span: 1 },
    { id: 'di24', type: 'private', name: 'Madison R.', people: [p('Madison R.')], pos: { col: 3, row: 4 }, span: 1 },
    { id: 'di25', type: 'private', name: 'Rachel C.', people: [p('Rachel C.')], pos: { col: 4, row: 4 }, span: 1 },
    { id: 'di26', type: 'private', name: 'Chloe P.', people: [p('Chloe P.')], pos: { col: 5, row: 4 }, span: 1 },
  ],
  'Preview': [
    { id: 'pv1', type: 'private', name: 'Arnav B.', people: [p('Arnav B.')], pos: { col: 0, row: 0 }, span: 1, spotify: { song: 'Some Might Say', artist: 'Oasis', art: '/spotify/oasis-some-might-say.png' } },
    { id: 'pv2', type: 'private', name: 'Tom D.', people: [p('Tom D.')], pos: { col: 1, row: 0 }, span: 1 },
    { id: 'pv3', type: 'private', name: 'Will H.', people: [p('Will H.')], pos: { col: 2, row: 0 }, span: 1, github: { repo: 'roam/app', number: 4812, title: 'Fix AInbox typing indicator ghost state', branch: 'fix/typing-ghost' } },
    { id: 'pv4', type: 'private', name: 'John H.', people: [p('John H.')], pos: { col: 3, row: 0 }, span: 1 },
    { id: 'pv5', type: 'private', name: 'Mattias L.', people: [p('Mattias L.')], pos: { col: 4, row: 0 }, span: 1, github: { repo: 'roam/app', number: 4830, title: 'Evals harness: parallel runs + retries', branch: 'mattias/evals-parallel' } },
    { id: 'pv6', type: 'private', name: 'Thomas G.', people: [p('Thomas G.')], pos: { col: 5, row: 0 }, span: 1, spotify: { song: 'Ne Me Quitte Pas', artist: 'Jacques Brel', art: '/spotify/jacques-brel-ne-me-quitte-pas.png' } },
    { id: 'pv7', type: 'private', name: 'Michael M.', people: [p('Michael M.')], pos: { col: 0, row: 1 }, span: 1, github: { repo: 'roam/app', number: 4825, title: 'Meeting card layout polish', branch: 'mm/meeting-cards' } },
    { id: 'pv8', type: 'private', name: 'Ava L.', people: [p('Ava L.')], pos: { col: 1, row: 1 }, span: 1 },
    { id: 'pv-sprint', type: 'meeting', name: 'Sprint Planning', people: [p('Derek C.'), p('Michael M.'), p('John M.'), p('Arnav B.'), p('Olivia S.'), p('Sophia R.')], pos: { col: 2, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'pv9', type: 'private', name: 'Howard L.', people: [p('Howard L.')], pos: { col: 4, row: 1 }, span: 1 },
    { id: 'pv10', type: 'private', name: 'Garima K.', people: [p('Garima K.')], pos: { col: 5, row: 1 }, span: 1 },
    { id: 'pv11', type: 'private', name: 'Lexi B.', people: [p('Lexi B.')], pos: { col: 0, row: 2 }, span: 1, spotify: { song: 'Redbone', artist: 'Childish Gambino', art: '/spotify/childish-gambino-redbone.png' } },
    { id: 'pv12', type: 'private', name: 'John B.', people: [p('John B.')], pos: { col: 1, row: 2 }, span: 1, github: { repo: 'roam/app', number: 4821, title: 'Spotify badge a11y + keyboard nav', branch: 'jb/spotify-a11y' } },
    { id: 'pv13', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 4, row: 2 }, span: 1, github: { repo: 'roam/app', number: 4834, title: 'Opus 4.7 rollout — staging flag', branch: 'klas/opus-47-staging' } },
    { id: 'pv14', type: 'private', name: 'Derek C.', people: [p('Derek C.')], pos: { col: 5, row: 2 }, span: 1, spotify: { song: 'Midnight City', artist: 'M83', art: '/spotify/m83-midnight-city.png' } },
    { id: 'pv15', type: 'private', name: 'Joe W.', people: [p('Joe W.')], pos: { col: 0, row: 3 }, span: 1 },
    { id: 'pv16', type: 'game', name: 'Break Room', people: [], pos: { col: 1, row: 3 }, span: 1 },
    { id: 'pv-design', type: 'meeting', name: 'Design Critique', people: [p('Chelsea T.'), p('Grace S.'), p('Camila T.'), p('Emily C.'), p('Isabella M.'), p('Madison R.')], pos: { col: 2, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 'pv-roadmap', type: 'meeting', name: 'Roadmap Review', people: [p('Jon B.'), p('Keegan L.'), p('Peter L.'), p('Sean M.'), p('Ethan B.'), p('Daniel R.'), p('Natalie W.'), p('Rachel C.')], pos: { col: 4, row: 3 }, colSpan: 2, rowSpan: 2 },
  ],
  'Support': [
    // Row 1 — help desk spanning top
    { id: 's-help', type: 'meeting', name: 'Help Desk', people: [p('Garima K.'), p('Lexi B.'), p('Will H.')], pos: { col: 0, row: 0 }, colSpan: 2, rowSpan: 1 },
    { id: 's1', type: 'private', name: 'Arnav B.', people: [p('Arnav B.')], pos: { col: 3, row: 0 }, span: 1 },
    { id: 's2', type: 'private', name: 'Mattias L.', people: [p('Mattias L.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 's3', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 5, row: 0 }, span: 1 },
    // Row 2
    { id: 's4', type: 'private', name: 'Tom D.', people: [], pos: { col: 0, row: 1 }, span: 1 },
    { id: 's5', type: 'private', name: 'Thomas G.', people: [p('Thomas G.')], pos: { col: 1, row: 1 }, span: 1 },
    { id: 's-triage', type: 'meeting', name: 'Triage Room', people: [p('John H.'), p('John M.'), p('Sean M.')], pos: { col: 3, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 's6', type: 'private', name: 'Michael W.', people: [p('Michael W.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 3 — training area
    { id: 's-train', type: 'theater', name: 'Training', people: [], pos: { col: 0, row: 2 }, colSpan: 2, rowSpan: 3 },
    { id: 's7', type: 'private', name: 'John B.', people: [p('John B.')], pos: { col: 5, row: 2 }, span: 1 },
    // Row 4
    { id: 's8', type: 'private', name: 'Aaron W.', people: [p('Aaron W.')], pos: { col: 2, row: 3 }, span: 1 },
    { id: 's9', type: 'private', name: 'Michael M.', people: [p('Michael M.')], pos: { col: 3, row: 3 }, span: 1 },
    { id: 's10', type: 'game', name: 'Break Room', people: [], pos: { col: 4, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 's11', type: 'private', name: 'Keegan L.', people: [p('Keegan L.')], pos: { col: 2, row: 4 }, span: 1 },
    { id: 's12', type: 'private', name: 'Ava L.', people: [p('Ava L.')], pos: { col: 3, row: 4 }, span: 1 },
  ],
};

const FLOOR_NAMES = Object.keys(FLOORS).filter(n => n !== 'Preview' && n !== 'Homepage');

// Sidebar rooms


// Story bubble — appears above avatar, matches Wonder's MapStory
// Simple story bubble — positioned via CSS inside grid cell
function SimpleStoryBubble({ image, delay = 0, onClick }) {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleClick = () => {
    setDismissing(true);
    setTimeout(() => {
      if (onClick) onClick();
    }, 300);
  };

  if (!visible) return null;

  const scale = dismissing ? 0.85 : hovered ? 1.15 : 1;
  return (
    <div
      className="sc-story-bubble"
      onClick={(e) => { e.stopPropagation(); handleClick(); }}
      onMouseEnter={() => !dismissing && setHovered(true)}
      onMouseLeave={() => !dismissing && setHovered(false)}
      style={{
        transform: `translateX(-50%) scale(${scale})`,
        opacity: dismissing ? 0 : 1,
        transition: dismissing
          ? 'transform 300ms ease-in, opacity 300ms ease-in'
          : undefined,
      }}
    >
      <div className="sc-story-rings">
        <div className="sc-story-ring" style={{ animationDelay: '0.4s' }} />
        <div className="sc-story-ring" style={{ animationDelay: '0.7s' }} />
        <div className="sc-story-ring" style={{ animationDelay: '1.4s' }} />
        <div className="sc-story-ring" style={{ animationDelay: '1.7s' }} />
      </div>
      <div className="sc-story-circle">
        <div className="sc-story-photo">
          {/\.(mp4|webm|mov)$/i.test(image) ? (
            <video className="sc-story-thumb" src={`${image}#t=0.1`} muted playsInline preload="auto" />
          ) : (
            <img className="sc-story-thumb" src={image} alt="" />
          )}
          <div className="sc-story-overlay">
            <img src="/icons/story.svg" width="20" height="20" alt="" />
          </div>
        </div>
      </div>
      {/* Tip arrow */}
      <div className="sc-story-tip">
        <svg width="14" height="7" viewBox="0 0 14 7" fill="none">
          <path d="M5.586 5.586L0 0H14L8.414 5.586a2 2 0 01-2.828 0z" fill="#2C80FF" />
        </svg>
      </div>
    </div>
  );
}

// Small "now playing" badge shown in the top-right of an occupied office.
// Hovering reveals a compact Spotify-style tooltip with song + artist.
function SpotifyBadge({ spotify, alwaysOpen = false, visible = true }) {
  const [hovered, setHovered] = useState(false);
  const showTooltip = visible && (alwaysOpen || hovered);

  // Icon lifecycle — phase is 'in' or 'out'; null means not yet in DOM.
  const [iconPhase, setIconPhase] = useState(null);
  useEffect(() => {
    if (visible) {
      setIconPhase('in');
    } else if (iconPhase !== null) {
      setIconPhase('out');
      const t = setTimeout(() => setIconPhase(null), 280);
      return () => clearTimeout(t);
    }
  }, [visible]);

  // Tooltip lifecycle — same pattern.
  const [tipPhase, setTipPhase] = useState(null);
  useEffect(() => {
    if (showTooltip) {
      setTipPhase('in');
    } else if (tipPhase !== null) {
      setTipPhase('out');
      const t = setTimeout(() => setTipPhase(null), 280);
      return () => clearTimeout(t);
    }
  }, [showTooltip]);

  if (iconPhase === null) return null;

  return (
    <div
      className={`sc-spotify-badge sc-spotify-badge-${iconPhase}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <img src="/icons/spotify.svg" alt="" className="sc-spotify-icon" />
      {tipPhase !== null && (
        <div
          className={`sc-spotify-tooltip sc-spotify-tooltip-${tipPhase}`}
          role="tooltip"
        >
          <div className="sc-spotify-tooltip-art" style={{ background: spotify.gradient }}>
            {spotify.art && <img src={spotify.art} alt="" />}
          </div>
          <div className="sc-spotify-tooltip-text">
            <p className="sc-spotify-tooltip-song">{spotify.song}</p>
            <p className="sc-spotify-tooltip-artist">{spotify.artist}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// GitHub "pending PR" badge — same shape / lifecycle as SpotifyBadge.
function GitHubBadge({ github, alwaysOpen = false, visible = true }) {
  const [hovered, setHovered] = useState(false);
  const showTooltip = visible && (alwaysOpen || hovered);

  const [iconPhase, setIconPhase] = useState(null);
  useEffect(() => {
    if (visible) {
      setIconPhase('in');
    } else if (iconPhase !== null) {
      setIconPhase('out');
      const t = setTimeout(() => setIconPhase(null), 280);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const [tipPhase, setTipPhase] = useState(null);
  useEffect(() => {
    if (showTooltip) {
      setTipPhase('in');
    } else if (tipPhase !== null) {
      setTipPhase('out');
      const t = setTimeout(() => setTipPhase(null), 280);
      return () => clearTimeout(t);
    }
  }, [showTooltip]);

  if (iconPhase === null) return null;

  return (
    <div
      className={`sc-github-badge sc-github-badge-${iconPhase}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className="sc-github-icon"
        aria-hidden="true"
        style={{
          WebkitMaskImage: 'url(/icons/integrations/github.svg)',
          maskImage: 'url(/icons/integrations/github.svg)',
        }}
      />
      {tipPhase !== null && (
        <div
          className={`sc-github-tooltip sc-github-tooltip-${tipPhase}`}
          role="tooltip"
        >
          <span
            className="sc-github-tooltip-icon"
            aria-hidden="true"
            style={{
              WebkitMaskImage: 'url(/icons/integrations/branch-request.svg)',
              maskImage: 'url(/icons/integrations/branch-request.svg)',
            }}
          />
          <div className="sc-github-tooltip-text">
            <p className="sc-github-tooltip-title">{github.title}</p>
            <p className="sc-github-tooltip-meta">{github.repo} #{github.number}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Figma "comment" badge — same shape / lifecycle as GitHubBadge.
function FigmaBadge({ figma, alwaysOpen = false, visible = true }) {
  const [hovered, setHovered] = useState(false);
  const showTooltip = visible && (alwaysOpen || hovered);

  const [iconPhase, setIconPhase] = useState(null);
  useEffect(() => {
    if (visible) {
      setIconPhase('in');
    } else if (iconPhase !== null) {
      setIconPhase('out');
      const t = setTimeout(() => setIconPhase(null), 280);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const [tipPhase, setTipPhase] = useState(null);
  useEffect(() => {
    if (showTooltip) {
      setTipPhase('in');
    } else if (tipPhase !== null) {
      setTipPhase('out');
      const t = setTimeout(() => setTipPhase(null), 280);
      return () => clearTimeout(t);
    }
  }, [showTooltip]);

  if (iconPhase === null) return null;

  return (
    <div
      className={`sc-figma-badge sc-figma-badge-${iconPhase}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <img src="/icons/integrations/figma.svg" alt="" className="sc-figma-icon" />
      {tipPhase !== null && (
        <div
          className={`sc-figma-tooltip sc-figma-tooltip-${tipPhase}`}
          role="tooltip"
        >
          <span
            className="sc-figma-tooltip-icon"
            aria-hidden="true"
            style={{
              WebkitMaskImage: 'url(/icons/integrations/figma-chat.svg)',
              maskImage: 'url(/icons/integrations/figma-chat.svg)',
            }}
          />
          <div className="sc-figma-tooltip-text">
            <p className="sc-figma-tooltip-title">{figma.comment}</p>
            <p className="sc-figma-tooltip-meta">{figma.file}{figma.author ? ` · ${figma.author}` : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// AI vibe icon with a hover tooltip ("Clauding" / "Codex" / "Vibing").
function AiVibeIcon({ src, label, combo = false }) {
  const [hovered, setHovered] = useState(false);
  const [tipPhase, setTipPhase] = useState(null);
  useEffect(() => {
    if (hovered) {
      setTipPhase('in');
    } else if (tipPhase !== null) {
      setTipPhase('out');
      const t = setTimeout(() => setTipPhase(null), 220);
      return () => clearTimeout(t);
    }
  }, [hovered]);
  return (
    <div
      className="sc-ai-icon-wrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <img className={`sc-ai-icon${combo ? ' sc-ai-icon-combo' : ''}`} src={src} alt="" />
      {tipPhase !== null && (
        <div className={`sc-ai-tooltip sc-ai-tooltip-${tipPhase}`} role="tooltip">
          {label}
        </div>
      )}
    </div>
  );
}

// Private office room card — uses the same markup as mapv3
function PrivateRoomCard({ room, storyBubble, onPersonClick, onRoomClick, spotifyAlwaysOpen = false, githubAlwaysOpen = false, figmaAlwaysOpen = false }) {
  const [talking, setTalking] = useState({});
  const hasTalk = room.people.length > 1;

  useEffect(() => {
    if (!hasTalk) return;
    const tick = () => {
      setTalking(prev => {
        const next = {};
        // Pick one person to talk, occasionally both, occasionally none
        const r = Math.random();
        if (r < 0.4) {
          // One person talks
          const idx = Math.floor(Math.random() * room.people.length);
          next[room.people[idx].name] = true;
        } else if (r < 0.55) {
          // Both talk (overlap)
          room.people.forEach(p => { next[p.name] = true; });
        }
        // else: silence
        return next;
      });
      return setTimeout(tick, 1200 + Math.random() * 2000);
    };
    let timer = tick();
    return () => clearTimeout(timer);
  }, [hasTalk]);

  const isEmpty = room.people.length === 0;
  const activeVibe = !isEmpty ? room.vibe : null; // 'claude' | 'codex' | 'both' | null
  const prevVibeRef = useRef(null);
  const [showGlow, setShowGlow] = useState(false);
  const [renderedVibe, setRenderedVibe] = useState(null);

  useEffect(() => {
    if (activeVibe) {
      setRenderedVibe(activeVibe);
      // Small delay so the element renders before fading in
      requestAnimationFrame(() => setShowGlow(true));
    } else if (prevVibeRef.current) {
      setShowGlow(false);
      // Keep the vibe during fade out, then clear
      const t = setTimeout(() => setRenderedVibe(null), 800);
      return () => clearTimeout(t);
    }
    prevVibeRef.current = activeVibe;
  }, [activeVibe]);

  const clickable = !!onRoomClick;
  return (
    <div
      className="sc-room-card"
      onClick={clickable ? () => onRoomClick(room) : undefined}
      style={clickable ? { cursor: 'pointer' } : undefined}
    >
      <div className={`sc-glow-fade ${showGlow ? 'sc-glow-visible' : ''}`}>
        {renderedVibe === 'claude' && <SiriGlow active={true} color={CLAUDE} intensity={3} borderRadius={12} />}
        {renderedVibe === 'codex' && <SiriGlow active={true} color={CODEX} intensity={3} borderRadius={12} />}
        {renderedVibe === 'both' && (
          <>
            <SiriGlow active={true} color={CLAUDE} intensity={3} borderRadius={12} />
            <SiriGlow active={true} color={CODEX} intensity={3} borderRadius={12} />
          </>
        )}
      </div>
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className={`office-name ${isEmpty ? 'sc-office-empty' : ''}`}>{room.name}</h3>
            {activeVibe === 'claude' && <AiVibeIcon src="/icons/claude.svg" label="Clauding" />}
            {activeVibe === 'codex' && <AiVibeIcon src="/icons/codex-white.svg" label="Codex" />}
            {activeVibe === 'both' && <AiVibeIcon src="/icons/vibe-combo.svg" label="Vibing" combo />}
            {room.spotify && <SpotifyBadge spotify={room.spotify} alwaysOpen={spotifyAlwaysOpen} visible={!isEmpty && !activeVibe} />}
            {room.github && <GitHubBadge github={room.github} alwaysOpen={githubAlwaysOpen} visible={!isEmpty && !activeVibe} />}
            {room.figma && <FigmaBadge figma={room.figma} alwaysOpen={figmaAlwaysOpen} visible={!isEmpty && !activeVibe} />}
          </div>
          {room.people.length > 0 && (
            <div className="private-office-seat">
              <div className="seat-row seat-row-hovered">
                {room.people.map((person, i) => (
                  <div key={person.name + i} className={`seat-assigned sc-private-person ${person.isJoining ? 'sc-joining' : ''}`} onClick={(e) => { e.stopPropagation(); onPersonClick && onPersonClick(person, e); }} style={{ cursor: getChatIdForAvatar(person.avatar) ? 'pointer' : 'default' }}>
                    <img className="seat-avatar" src={person.avatar} alt={person.name} />
                    <span className="seat-nametag">{person.name}</span>
                    {hasTalk && <div className={`sc-private-talk-ring ${talking[person.name] ? 'sc-talking' : ''}`} />}
                    {i === 0 && storyBubble}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Theater room card — stage with 2 speakers + audience rows with dots
function TheaterRoomCard({ room, speakers = [], onPersonClick, speakerStories = {}, viewedStories = {}, onStoryClick, onRoomClick }) {
  const [talkingIdx, setTalkingIdx] = useState(1);

  // Alternate which speaker is talking
  useEffect(() => {
    const t = setInterval(() => {
      setTalkingIdx(idx => (idx === 0 ? 1 : 0));
    }, 2200 + Math.random() * 1500);
    return () => clearInterval(t);
  }, []);

  // Row segments — each number is how many audience dots sit in that bench segment
  const audienceRows = [
    [0, 3, 0, 2, 4],
    [4, 0, 2, 3, 0],
    [0, 2, 4, 0, 3],
  ];
  // Which dot in each bench (if any) is the highlighted/active one — [rowIdx, benchIdx, dotIdx]
  const activeDot = [1, 0, 1];

  return (
    <div className="sc-room-card" onClick={() => onRoomClick && onRoomClick(room)} style={{ cursor: 'pointer' }}>
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
          </div>
          <div className="theater-preview">
            <div className="theater-preview-stage sc-theater-stage">
              {speakers.map((s, i) => {
                const story = speakerStories[s.name];
                return (
                  <div
                    key={s.name}
                    className="sc-theater-speaker"
                    onClick={(e) => { e.stopPropagation(); onPersonClick && onPersonClick(s, e); }}
                    style={{ cursor: getChatIdForAvatar(s.avatar) ? 'pointer' : 'default' }}
                  >
                    <div className={`sc-private-talk-ring ${talkingIdx === i ? 'sc-talking' : ''}`} />
                    <img className="sc-theater-speaker-img" src={s.avatar} alt={s.name} />
                    {story && !viewedStories[story] && (
                      <SimpleStoryBubble
                        image={story}
                        delay={2000 + i * 400}
                        onClick={() => onStoryClick && onStoryClick(story)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="theater-preview-audience">
              {audienceRows.map((row, rowIdx) => (
                <div key={rowIdx} className="theater-preview-row">
                  {row.map((count, benchIdx) => (
                    <div key={benchIdx} className="theater-preview-bench">
                      {count > 0 && (
                        <div className="theater-preview-dots">
                          {Array.from({ length: count }).map((_, dotIdx) => {
                            const isActive = activeDot[0] === rowIdx && activeDot[1] === benchIdx && activeDot[2] === dotIdx;
                            return <div key={dotIdx} className={`theater-preview-dot ${isActive ? 'theater-preview-dot-active' : ''}`} />;
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Meeting room card — same markup as mapv3, with talking indicators
function MeetingRoomCardShowcase({ room, onPersonClick, onRoomClick }) {
  const [talking, setTalking] = useState({});

  useEffect(() => {
    if (!room.people.length) return;
    const interval = setInterval(() => {
      setTalking(() => {
        const next = {};
        room.people.forEach(p => { if (Math.random() < 0.35) next[p.name] = true; });
        return next;
      });
    }, 1500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [room.people]);

  return (
    <div className="sc-room-card" onClick={() => onRoomClick && onRoomClick(room)} style={{ cursor: 'pointer' }}>
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
            <img src="/icons/video.svg" className="sc-room-video-icon" width="16" height="16" alt="" />
          </div>
          <div className="meeting-room-people">
            {room.people.filter(p => p?.video).map((person, i) => (
              <div key={person.name + i} className={`person meeting-room-person ${person._new ? 'sc-person-arriving' : ''} ${person.isJoining ? 'sc-joining' : ''}`} onClick={(e) => { e.stopPropagation(); onPersonClick && onPersonClick(person, e); }} style={{ cursor: getChatIdForAvatar(person.avatar) ? 'pointer' : 'default' }}>
                <img className="avatar" src={person.avatar} alt={person.name} />
                <div className={`avatar-inner-glow ${talking[person.name] ? 'sc-talking' : 'glow-off'}`} />
              </div>
            ))}
          </div>
          <div className="meeting-room-lines" />
        </div>
      </div>
    </div>
  );
}

// Game room card — same markup as mapv3
function GameRoomCard({ room }) {
  return (
    <div className="sc-room-card">
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="game-room-lines"><div className="game-room-zigzag" /></div>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

// Command center card — same markup as mapv3
function CommandCenterCard({ room }) {
  return (
    <div className="sc-room-card">
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
            <span className="room-count">{room.people.length} here</span>
          </div>
          <div className="command-center-preview">
            <div className="command-screen" />
            <div className="command-screen" />
            <div className="command-screen" />
          </div>
        </div>
      </div>
    </div>
  );
}


// Floor card — auto-generates mini map from room data
function FloorCard({ name, rooms, active, onClick }) {
  return (
    <div className={`sc-floor-card ${active ? 'sc-floor-active' : ''}`} onClick={onClick}>
      <span className="sc-floor-name">{name}</span>
      <div className="sc-floor-mini-grid">
        {rooms.map(room => {
          const gridColumn = room.colSpan ? `${room.pos.col + 1} / span ${room.colSpan}` : `${room.pos.col + 1}`;
          const gridRow = room.rowSpan ? `${room.pos.row + 1} / span ${room.rowSpan}` : `${room.pos.row + 1}`;
          return (
            <div key={room.id} className="sc-mini-office" style={{ gridColumn, gridRow }}>
              {room.people.slice(0, 4).map((person, i) => (
                <img key={person.name + i} className="sc-mini-avatar" src={person.avatar} alt="" />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}


const MAGICAST_SHAPES = [
  { id: 'circle', mask: '/magicast/circleMask.svg' },
  { id: 'circleScalloped', mask: '/magicast/circleScallopedMask.svg' },
  { id: 'pentagon', mask: '/magicast/pentagonMask.svg' },
  { id: 'square', mask: '/magicast/squareMask.svg' },
];

function MagicastBubble({ onPositionChange, closing, initialSize = 260, initialPos = { x: 820, y: 340 }, shape, onShapeChange }) {
  const [size, setSize] = useState(initialSize);
  const [pos, setPos] = useState(null);
  const setShape = onShapeChange;
  const [hovered, setHovered] = useState(false);
  const resizing = useRef(null);
  const dragging = useRef(null);

  const maskUrl = MAGICAST_SHAPES.find(s => s.id === shape)?.mask || MAGICAST_SHAPES[0].mask;

  useEffect(() => {
    const onMove = (e) => {
      if (resizing.current) {
        const { corner: c, mouseX: mx, mouseY: my, startSize: ss, startPosX: sx, startPosY: sy } = resizing.current;
        const dx = e.clientX - mx;
        const dy = e.clientY - my;
        let delta;
        if (c === 'br') delta = Math.max(dx, dy);
        else if (c === 'bl') delta = Math.max(-dx, dy);
        else if (c === 'tr') delta = Math.max(dx, -dy);
        else delta = Math.max(-dx, -dy);
        const ns = Math.max(80, Math.min(400, ss + delta));
        const d = ns - ss;
        setSize(ns);
        if (c === 'tl') setPos({ x: sx - d, y: sy - d });
        else if (c === 'tr') setPos({ x: sx, y: sy - d });
        else if (c === 'bl') setPos({ x: sx - d, y: sy });
      } else if (dragging.current) {
        setPos({
          x: dragging.current.startX + e.clientX - dragging.current.mouseX,
          y: dragging.current.startY + e.clientY - dragging.current.mouseY,
        });
      }
    };
    const onUp = () => { resizing.current = null; dragging.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  useEffect(() => {
    if (onPositionChange) {
      const bubbleRef = document.querySelector('.mc-bubble');
      if (bubbleRef) {
        const rect = bubbleRef.getBoundingClientRect();
        onPositionChange({ x: rect.left / window.innerWidth, y: rect.top / window.innerHeight });
      }
    }
  }, [pos, size, onPositionChange]);

  const defaultPos = initialPos;
  const startDrag = (e) => {
    if (resizing.current) return;
    e.preventDefault();
    const currentPos = pos || defaultPos;
    if (!pos) setPos(defaultPos);
    dragging.current = { startX: currentPos.x, startY: currentPos.y, mouseX: e.clientX, mouseY: e.clientY };
  };

  const startResize = (e, corner) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = { mouseX: e.clientX, mouseY: e.clientY, startSize: size, startPosX: pos.x, startPosY: pos.y, corner };
  };

  return (
    <div
      className={`mc-bubble ${closing ? 'mc-bubble-closing' : ''}`}
      style={pos ? { left: pos.x, top: pos.y, width: size, height: size } : { left: defaultPos.x, top: defaultPos.y, width: size, height: size }}
      onMouseDown={startDrag}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (!resizing.current && !dragging.current) setHovered(false); }}
    >
      <div
        className={`mc-bubble-masked ${shape === 'square' ? 'mc-bubble-masked-square' : ''}`}
        style={shape !== 'square' ? { WebkitMaskImage: `url(${maskUrl})`, maskImage: `url(${maskUrl})` } : undefined}
      >
        <video className="mc-bubble-video" src="/videos/Female/sophia_ramirez.mp4" autoPlay loop muted playsInline />
      </div>
      <div className={`mc-bubble-hover-ui ${hovered ? 'mc-bubble-hover-visible' : ''}`}>
        <img className="mc-bubble-outline" src="/magicast/outline.svg" alt="" />
        <div className="mc-bubble-corner mc-bubble-corner-tl" onMouseDown={(e) => startResize(e, 'tl')}><img src="/magicast/corner.svg" alt="" /></div>
        <div className="mc-bubble-corner mc-bubble-corner-tr" onMouseDown={(e) => startResize(e, 'tr')}><img src="/magicast/corner.svg" alt="" style={{ transform: 'rotate(90deg)' }} /></div>
        <div className="mc-bubble-corner mc-bubble-corner-br" onMouseDown={(e) => startResize(e, 'br')}><img src="/magicast/corner.svg" alt="" style={{ transform: 'rotate(180deg)' }} /></div>
        <div className="mc-bubble-corner mc-bubble-corner-bl" onMouseDown={(e) => startResize(e, 'bl')}><img src="/magicast/corner.svg" alt="" style={{ transform: 'rotate(270deg)' }} /></div>
        <div className="mc-bubble-shapes">
          {[
            { id: 'circle', icon: '/magicast/shape-circle.svg' },
            { id: 'circleScalloped', icon: '/magicast/shape-squiggle.svg' },
            { id: 'pentagon', icon: '/magicast/shape-pentagon.svg' },
            { id: 'square', icon: '/magicast/shape-square.svg' },
          ].map(s => (
            <button
              key={s.id}
              className={`mc-bubble-shape ${shape === s.id ? 'mc-bubble-shape-active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setShape(s.id); }}
            >
              <img src={s.icon} alt="" className="mc-bubble-shape-icon" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MagicastWindow({ win, onDrag, pipPos, shape = 'circle' }) {
  const maskUrl = MAGICAST_SHAPES.find(s => s.id === shape)?.mask || MAGICAST_SHAPES[0].mask;
  const [closing, setClosing] = useState(false);
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 180);
  };
  useEffect(() => {
    if (win.closeRequestId) handleClose();
  }, [win.closeRequestId]);
  return (
    <div
      className={`mc-win ${!win.isFocused ? 'mc-win-unfocused' : ''} ${closing ? 'mc-win-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      <div className="mc-win-titlebar" onMouseDown={onDrag}>
        <div className="mc-win-lights">
          <div className="mc-win-light mc-win-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="mc-win-light mc-win-light-min" />
          <div className="mc-win-light mc-win-light-max" />
        </div>
        <span className="mc-win-title">Magicast</span>
      </div>
      <div className="mc-win-body">
        <div className="mc-win-preview">
          <img className="mc-win-preview-bg" src="/magicast/preview.png" alt="" />
          <div className="mc-win-preview-overlay" />
          <video className={`mc-win-preview-avatar ${shape === 'square' ? 'mc-win-preview-avatar-square' : ''}`} src="/videos/Female/sophia_ramirez.mp4" autoPlay loop muted playsInline style={{ ...(pipPos ? { left: `${pipPos.x * 100}%`, top: `${pipPos.y * 100}%` } : {}), ...(shape !== 'square' ? { WebkitMaskImage: `url(${maskUrl})`, maskImage: `url(${maskUrl})`, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: '100%', maskSize: '100%' } : {}) }} />
        </div>
        <div className="mc-win-row">
          <span className="mc-win-row-icon" style={{ WebkitMaskImage: 'url(/magicast/video.svg)', maskImage: 'url(/magicast/video.svg)' }} />
          <span className="mc-win-row-label">Camera</span>
          <span className="mc-win-row-value">Logi 4K Pro</span>
          <div className="mc-win-row-chevron">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 5L8 9L12 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <div className="mc-win-row">
          <span className="mc-win-row-icon" style={{ WebkitMaskImage: 'url(/magicast/microphone.svg)', maskImage: 'url(/magicast/microphone.svg)' }} />
          <span className="mc-win-row-label">Microphone</span>
          <span className="mc-win-row-value">Default</span>
          <div className="mc-win-row-chevron">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 5L8 9L12 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <div className="mc-win-row">
          <span className="mc-win-row-icon" style={{ WebkitMaskImage: 'url(/magicast/monitor.svg)', maskImage: 'url(/magicast/monitor.svg)' }} />
          <span className="mc-win-row-label">Screens</span>
          <span className="mc-win-row-value">Entire Screen</span>
          <svg className="mc-win-row-chev-right" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="mc-win-row">
          <span className="mc-win-row-icon" style={{ WebkitMaskImage: 'url(/magicast/effects.svg)', maskImage: 'url(/magicast/effects.svg)' }} />
          <span className="mc-win-row-label">Effects</span>
          <span className="mc-win-row-value">Background Blur</span>
          <svg className="mc-win-row-chev-right" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <button className="mc-win-record">Start Recording</button>
      </div>
    </div>
  );
}

// Custom AInbox data for the Group Chat feature embed — looks like an engineer's inbox
const AINBOX_ENG_FAVORITES = [
  { id: 'jon-fav', name: 'Jon', avatar: '/headshots/jon-brod.jpg', type: 'dm' },
  { id: 'klas-fav', name: 'Klas', avatar: '/headshots/klas-leino.jpg', type: 'dm' },
  { id: 'engineering', name: 'Engineering', avatar: '/groups/Group Computer.png', type: 'group' },
];

const AINBOX_ENG_SECTIONS = [
  {
    id: 'dms', label: 'Direct Messages',
    items: [
      { id: 'rob', name: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', type: 'dm' },
      { id: 'arnav', name: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg', type: 'dm' },
      { id: 'mattias', name: 'Mattias Leino', avatar: '/headshots/mattias-leino.jpg', type: 'dm' },
      { id: 'thomas-eng', name: 'Thomas Grapperon', avatar: '/headshots/thomas-grapperon.jpg', type: 'dm' },
    ],
  },
  {
    id: 'meetings', label: 'Meetings',
    items: [
      { id: 'meet-api', name: 'API Refactor Sync', type: 'meeting' },
      { id: 'meet-retro', name: 'Sprint Retro', type: 'meeting' },
    ],
  },
  {
    id: 'groups', label: 'My Groups',
    items: [
      { id: 'engineering', name: 'Engineering', groupImg: '/groups/Group Computer.png', type: 'group', memberCount: 14 },
      { id: 'backend', name: 'Backend', groupImg: '/groups/Group Features.png', type: 'group', memberCount: 7 },
      { id: 'infra', name: 'Infra', groupImg: '/groups/Group Roam.png', type: 'group', memberCount: 5 },
      { id: 'mobile', name: 'Mobile', groupImg: '/groups/Group Apple.png', type: 'group', memberCount: 6 },
      { id: 'web', name: 'Web', groupImg: '/groups/Group Android.png', type: 'group', memberCount: 8 },
    ],
  },
  {
    id: 'threads', label: 'Threads',
    items: [
      { id: 'eng-thread-1', name: 'Auth migration looks clean...', type: 'thread', threadRef: { chatId: 'engineering', messageId: 2 } },
    ],
  },
];

const AINBOX_ENG_MESSAGES = {
  engineering: {
    type: 'group', name: 'Engineering', memberCount: 14,
    groupImg: '/groups/Group Computer.png',
    avatars: ['/headshots/rob-figueiredo.jpg', '/headshots/arnav-bansal.jpg', '/headshots/mattias-leino.jpg'],
    pinnedItems: [
      { label: 'GitHub', emoji: null, avatar: '/icons/favicons/favicon-design-1.png' },
      { label: 'Linear', emoji: null, avatar: '/icons/favicons/favicon-design-dribbble.png' },
    ],
    typingAvatars: ['/headshots/thomas-grapperon.jpg'],
    messages: [
      {
        id: 1, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: 'Weds 9:14 AM',
        text: "Heads up — kicking off the auth service migration this morning. Going to roll all clients over to the new identity provider in a feature flag.",
      },
      {
        id: 2, sender: 'Mattias Leino', avatar: '/headshots/mattias-leino.jpg', time: 'Weds 11:42 AM',
        text: "Just landed the migration to the new auth service. All endpoints are now hitting the new identity provider behind the flag — let me know if you spot any 401s in your local environments.",
        thread: {
          count: 4, lastReply: 'today 10:45 AM',
          replies: [
            { id: 'r1', sender: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg', text: "Smooth migration on my end — ran the iOS suite against staging, no regressions." },
            { id: 'r2', sender: 'Thomas Grapperon', avatar: '/headshots/thomas-grapperon.jpg', text: "All clear on Android too. The token refresh is noticeably faster, ~80ms shaved off cold start." },
            { id: 'r3', sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', text: "Backend's looking good. Latency is down ~30ms on /me calls. Did you also wire up the rotating refresh tokens?" },
            { id: 'r4', sender: 'Mattias Leino', avatar: '/headshots/mattias-leino.jpg', text: "Yep — refresh rotation is live. TTL is 15m on access tokens, 30 days sliding on refresh. We can dial it down if SSO complains." },
          ],
        },
      },
      {
        id: 3, sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', time: 'Thu 8:30 AM',
        text: "Reminder: Sprint planning today at 2 PM. Please make sure your Linear tickets are estimated by then.",
      },
      {
        id: 4, sender: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg', time: 'Thu 2:11 PM',
        text: "Pushed a fix for the websocket reconnect storm — backoff is now exponential with jitter. Memory pressure on the gateway dropped by ~40%.",
      },
      {
        id: 5, sender: 'Thomas Grapperon', avatar: '/headshots/thomas-grapperon.jpg', time: 'Fri 10:08 AM',
        text: "FYI the new room-state diff format is in main. Payloads are about 60% smaller on average — big win for cellular clients.",
      },
    ],
  },
};

function MapFeatureVisual({ theme, className }) {
  return (
    <div className={`sc-feature-visual sc-feature-visual-left sc-feature-visual-map${className ? ' ' + className : ''}`}>
      <div className="sc-feature-wallpaper sc-feature-wallpaper-map" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}>
        <div className="sc-map-feature-window-host">
          <ShowcaseMap embedded initialFloor="Homepage" />
        </div>
      </div>
    </div>
  );
}

function DropInFeatureVisual({ theme, className }) {
  return (
    <div className={`sc-feature-visual sc-feature-visual-map${className ? ' ' + className : ''}`}>
      <div className="sc-feature-wallpaper sc-feature-wallpaper-map" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}>
        <div className="sc-map-feature-window-host">
          <ShowcaseMap embedded autoKnock initialFloor="DropIn" />
        </div>
      </div>
    </div>
  );
}

function OnItFeatureChat() {
  const INITIAL = [
    { id: 1, self: true, text: 'Can you tell me if you see Sean MacIsaac and Thomas Grapperon meeting together?' },
    { id: 2, self: false, text: "I'm On-It! I'll notify you the next time I notice that Sean MacIsaac and Thomas Grapperon are meeting together." },
  ];
  const [messages, setMessages] = useState(INITIAL);
  const [inputText, setInputText] = useState('');
  const messagesRef = useRef(null);
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages.length]);
  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    setMessages(m => [...m, { id: Date.now(), self: true, text }]);
    setInputText('');
  };
  const renderBubble = (m, prev) => {
    const isFirstInGroup = !prev || prev.self !== m.self;
    const radiusIn = isFirstInGroup ? '18px 18px 18px 4px' : '4px 18px 18px 4px';
    const radiusOut = isFirstInGroup ? '20px 20px 4px 20px' : '20px 4px 4px 20px';
    return (
      <div key={m.id} className={`mc-msg ${m.self ? 'mc-msg-self' : ''} ${!isFirstInGroup ? 'mc-msg-consecutive' : ''}`}>
        <div className={`mc-msg-bubble ${m.self ? 'mc-msg-bubble-self' : ''}`} style={{ borderRadius: m.self ? radiusOut : radiusIn }}>
          <p>{m.text}</p>
        </div>
      </div>
    );
  };
  return (
    <div className="mc-window sc-onit-window" style={{ position: 'relative', left: 0, top: 0 }}>
      <div className="mc-header">
        <div className="mc-traffic-lights">
          <div className="mc-light mc-light-close" />
          <div className="mc-light mc-light-minimize" />
          <div className="mc-light mc-light-maximize" />
        </div>
        <div className="mc-header-center">
          <img src="/on-it-agent.png" alt="" className="mc-header-avatar" />
          <span className="mc-header-name">On-It</span>
        </div>
      </div>
      <div className="mc-body sc-onit-body">
        <div className="sc-onit-chat-col">
          <div className="mc-messages" ref={messagesRef}>
            {messages.map((m, i) => renderBubble(m, messages[i - 1]))}
          </div>
          <div className="ainbox-composer">
            <div className="ainbox-composer-box">
              <div className="ainbox-composer-field">
                <input
                  placeholder="Ask anything"
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
                  <img
                    src="/icons/composer/Send.svg"
                    alt=""
                    className={`ainbox-toolbar-img ainbox-send-icon ${inputText.trim() ? 'ainbox-send-active' : ''}`}
                    onClick={sendMessage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sc-onit-task-col">
          <OnItTaskPane />
        </div>
      </div>
    </div>
  );
}

const HOMEPAGE_REVIEWS = [
  { quote: "@roam is such a phenomenal and carefully crafted product", name: 'Scott Belsky', title: 'Founder', company: 'A24 Labs & Behance', avatar: '/reviews/scott-belsky.jpg', link: 'https://x.com/scottbelsky/status/1857278962210058351' },
  { quote: "If you are a small or medium sized startup and you aren't using @roam, think again.", name: 'Michael Arrington', title: 'Founder', company: 'TechCrunch & Arrington Capital', avatar: '/reviews/arrington.jpg', link: 'https://x.com/arrington/status/1857098914891006341' },
  { quote: "Use @roam", name: 'Anthony Pompliano', title: 'Founder & CEO', company: 'Professional Capital Management', avatar: '/reviews/apompliano.jpg', link: 'https://x.com/APompliano/status/1688928271868801025' },
  { quote: "It's literally groundbreaking for remote teams. Our average conversations amongst team members has gone up by 20x.", name: 'Nicholas Hildebrandt', title: 'CEO', company: 'WithLore', avatar: '/reviews/nicholas-hildebrandt.jpg', link: 'https://x.com/TheNPCEO/status/1982869601445941672' },
  { quote: "Since using it, team culture has improved, communication is smoother, and remote work feels much more human.", name: 'Ezequiel Bucai', title: 'Founder & CEO', company: 'Wibond', avatar: '/reviews/ezequiel-bucai.jpg', link: 'https://www.linkedin.com/posts/ezequiel-bucai-2942a328_tu-equipo-es-100-remoto-esto-te-puede-activity-7330624945116352512-eK7y' },
  { quote: "Roam brings the magic of in person collaboration to a remote company — far fewer meetings on the calendar.", name: 'Tarush Aggarwal', title: 'Founder & CEO', company: '5x', avatar: '/reviews/tarush-aggarwal.jpg', link: 'https://www.linkedin.com/posts/tarushaggarwal_weve-been-loving-our-experience-with-roam-activity-7396495212405088256-J5Tw' },
  { quote: "Roam chose an interface that invites collaboration both passively and actively. It makes it feel like you're together.", name: 'Andrew Hutson', title: 'COO', company: 'QFlow', avatar: '/reviews/andrew-hutson.jpg', link: 'https://www.g2.com/products/roam/reviews/roam-review-9668429' },
  { quote: "Our average meeting time at Myko is 6.9 min. Our virtual HQ Roam makes it easy to have quick conversations.", name: 'Trevor Lee', title: 'Co-Founder & CEO', company: 'Myko AI', avatar: '/reviews/trevor-lee.jpg', link: 'https://www.linkedin.com/posts/trevorlee20_our-average-meeting-time-at-myko-is-69min-activity-7333591989403205634-e5YC' },
  { quote: "After 30 days of Roam, we're addicted. We have literally abandoned @slack, @zoom, and @Calendly.", name: 'Net Kohen', title: 'CEO', company: 'Link Me', avatar: '/reviews/net-kohen.jpg', link: 'https://x.com/NetKohen/status/1919519266782507194' },
  { quote: "Roam… Check it out. Its saved us so much time and energy. What they have created is truly remarkable. Howard Lerman and Roam team you have done so well…", name: 'Adam Ritter', title: 'Co-Founder', company: 'HomeKynd', avatar: '/reviews/adam-ritter.jpg', link: 'https://www.linkedin.com/posts/adamritter1_roam-check-it-out-its-saved-us-so-much-activity-7272999235929681921-gJbu' },
  { quote: "At Deepgram we cannot understate how fundamentally Roam has shifted our remote culture away from not just communicating online to actually collaborating in a shared space.", name: 'Hannah Gorelik', title: 'Manager', company: 'Deepgram', avatar: '/reviews/hannah-gorelik.jpg', link: 'https://www.linkedin.com/feed/update/urn:li:activity:7184972666448048128' },
  { quote: "Roam is becoming a big part of how our show teams around the world connect together.", name: 'Duncan Fisher', title: 'Director', company: 'Cirque du Soleil', avatar: '/reviews/duncan-fisher.jpg', link: 'https://www.linkedin.com/feed/update/urn:li:activity:7207336015240249345' },
];

function getSocialIcon(url = '') {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host === 'x.com' || host === 'twitter.com' || host.endsWith('.x.com') || host.endsWith('.twitter.com')) return '/icons/social/x.svg';
    if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return '/icons/social/linkedin.svg';
    if (host === 'g2.com' || host.endsWith('.g2.com')) return '/icons/social/g2.svg';
    if (host === 'reddit.com' || host.endsWith('.reddit.com')) return '/icons/social/reddit.svg';
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) return '/icons/social/instagram.svg';
  } catch { /* fall through */ }
  return null;
}

function HomepageReviews() {
  return (
    <section className="sc-reviews-section">
      <div className="sc-reviews-container">
        <div className="sc-reviews-intro">
          <h2 className="sc-reviews-heading">See what our customers say</h2>
        </div>
        {HOMEPAGE_REVIEWS.map((r) => {
          const icon = getSocialIcon(r.link);
          return (
            <a
              key={r.name}
              href={r.link}
              target="_blank"
              rel="noopener noreferrer"
              className="sc-review-card"
            >
              {icon && (
                <span
                  className="sc-review-social-icon"
                  aria-hidden="true"
                  style={{ WebkitMaskImage: `url(${icon})`, maskImage: `url(${icon})` }}
                />
              )}
              <p className="sc-review-quote">&ldquo;{r.quote}&rdquo;</p>
              <div className="sc-review-meta">
                <img src={r.avatar} alt="" className="sc-review-avatar" />
                <div className="sc-review-person">
                  <div className="sc-review-name">{r.name}</div>
                  <div className="sc-review-title">{r.title}, {r.company}</div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function MagicastFeatureVisual({ theme, className }) {
  const [shape, setShape] = useState('circle');
  return (
    <div className={`sc-feature-visual${className ? ' ' + className : ''}`} style={{ position: 'relative' }}>
      <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}>
        <MagicastWindow win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }} onDrag={() => {}} shape={shape} />
      </div>
      <MagicastBubble initialSize={240} initialPos={{ x: 530, y: 420 }} shape={shape} onShapeChange={setShape} />
    </div>
  );
}


const INITIAL_WINDOWS = [
  { id: 'map', isOpen: true, position: { x: 0, y: 0 }, zIndex: 25 },
  { id: 'ainbox', isOpen: false, position: { x: 60, y: 300 }, zIndex: 30 },
  { id: 'onair', isOpen: false, position: { x: 60, y: 300 }, zIndex: 30 },
  { id: 'meeting', isOpen: false, position: { x: 80, y: 250 }, zIndex: 30 },
  { id: 'theater', isOpen: false, position: { x: 70, y: 220 }, zIndex: 30 },
  { id: 'shelf', isOpen: false, position: { x: 120, y: 280 }, zIndex: 30 },
  { id: 'magicast', isOpen: false, position: { x: 40, y: 160 }, zIndex: 30 },
  { id: 'magicminutes', isOpen: false, position: { x: 60, y: 180 }, zIndex: 30 },
  { id: 'recordings', isOpen: false, position: { x: 80, y: 160 }, zIndex: 30 },
  { id: 'lobby', isOpen: false, position: { x: 100, y: 140 }, zIndex: 30 },
  { id: 'mobile', isOpen: false, position: { x: 120, y: 80 }, zIndex: 30 },
];

const SHELF_TOTAL = 12;

function KnockDialog({ room, onCancel }) {
  const firstName = (room?.people?.[0]?.fullName || room?.people?.[0]?.name || room?.name || '').split(/\s+/)[0] || 'their';
  return (
    <div className="sc-knock-overlay" onClick={onCancel}>
      <div className="sc-knock-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="sc-knock-icon">
          <img src="/icons/knock.svg" alt="" />
        </div>
        <div className="sc-knock-label">Knocking on {firstName}'s Door<span className="sc-knock-dots"><span>.</span><span>.</span><span>.</span></span></div>
        <button className="sc-knock-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function ShelfWindow({ win, onDrag, photoIdx, direction, onPrev, onNext }) {
  const [closing, setClosing] = useState(false);
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 180);
  };
  return (
    <div
      className={`shelf-win ${!win.isFocused ? 'shelf-win-unfocused' : ''} ${closing ? 'shelf-win-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      <div className="shelf-win-titlebar" onMouseDown={onDrag}>
        <div className="shelf-win-lights">
          <div className="shelf-win-light shelf-win-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="shelf-win-light shelf-win-light-min" />
          <div className="shelf-win-light shelf-win-light-max" />
        </div>
        <div className="shelf-win-title">
          <button className="shelf-win-nav" aria-label="Previous" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="shelf-win-title-text">{photoIdx} / {SHELF_TOTAL}</span>
          <button className="shelf-win-nav" aria-label="Next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="shelf-win-title-spacer" />
      </div>
      <div className="shelf-win-body">
        <img key={photoIdx} className={`shelf-win-img ${direction ? `shelf-win-img-${direction}` : ''}`} src={`/shelf/photos/photo-${photoIdx}.png`} alt="" />
      </div>
    </div>
  );
}

// Main showcase component
export default function ShowcaseMap({ initialFloor = 'R&D', embedded = false, autoKnock = false, spotifyAlwaysOpen = false, githubAlwaysOpen = false, hideOnIt = false, theme } = {}) {
  return (
    <ChatProvider>
      <WindowManagerProvider initialWindows={INITIAL_WINDOWS}>
        <ShowcaseMapInner initialFloor={initialFloor} embedded={embedded} autoKnock={autoKnock} spotifyAlwaysOpen={spotifyAlwaysOpen} githubAlwaysOpen={githubAlwaysOpen} hideOnIt={hideOnIt} themeOverride={theme} />
      </WindowManagerProvider>
    </ChatProvider>
  );
}

function ProductItem({ name, active, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <span
      className={`sc-products-item ${active ? 'sc-products-item-active' : ''}`}
      data-label={name}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {name}
    </span>
  );
}


const PRODUCTS = [
  { name: 'Virtual Office' },
  { name: 'Drop-In Meetings' },
  { name: 'Theater' },
  { name: 'AInbox' },
  { name: 'Lobby' },
  { name: 'Magicast' },
  { name: 'Magic Minutes' },
  { name: 'On-It' },
  { name: 'On-Air' },
  { name: 'Mobile' },
];

const HINT_BLOBS = {
  squiggle: {
    viewBox: '0 0 105 50',
    strokeWidth: 20,
    d: 'M11.7979 28.2915C11.7664 28.2915 18.5772 22.4576 22.333 20.5719C31.824 15.8068 38.3529 11.9222 39.1367 12.0002C40.1678 12.1027 39.5956 15.2438 37.8693 21.2281C36.6289 25.5282 34.1167 32.2288 33.2468 35.5397C32.377 38.8507 33.0896 38.5269 36.0768 36.2944C44.4078 30.0679 49.8009 26.0446 49.8892 26.9359C49.9404 27.4536 49.7597 28.1139 49.5082 28.9741C49.2567 29.8342 48.8773 30.8766 50.6701 29.8848C52.4629 28.893 56.4395 25.8355 58.6156 24.6293C60.7916 23.4232 61.0467 24.1612 61.1781 25.433C61.3095 26.7048 61.3095 28.4881 61.4955 29.5778C61.6816 30.6675 62.0536 31.0096 62.7643 30.9137C64.6087 30.6648 70.3738 26.2757 77.6641 21.511C80.0337 19.9623 80.2238 21.0697 79.5305 23.1423C77.7152 28.569 75.7412 32.2593 75.7202 32.9551C75.7028 33.5311 81.4791 29.2448 88.8073 23.7441C91.2742 21.8924 91.574 22.4813 91.4995 23.9278C91.2992 27.8163 90.6685 30.8728 90.9544 31.9683C91.1061 32.5492 91.8975 32.9159 92.8065 32.9647',
  },
  peaks: {
    viewBox: '0 0 108 60',
    strokeWidth: 20,
    d: 'M10.0045 38.1941C9.98392 38.1941 10.0232 37.3823 10.3379 35.3249C10.7905 32.3653 12.7762 28.4701 15.3117 24.0437C16.5802 21.8291 18.0682 19.8303 19.3853 18.142C21.7652 15.0914 24.1206 13.0206 26.0857 11.5547C28.6806 9.61893 30.1698 9.98476 30.6719 10.1128C31.124 10.228 31.0502 13.2065 30.3257 21.8996C29.806 28.1346 28.1651 37.991 27.4182 43.366C26.6713 48.741 26.6604 49.3153 26.977 49.3435C27.2936 49.3717 27.9381 48.8364 32.6249 42.578C37.3118 36.3195 46.0213 24.3541 50.957 17.7409C55.8926 11.1277 56.7904 10.2292 57.2871 10.1038C57.7838 9.97831 57.8521 10.6531 57.426 13.4962C56.9999 16.3393 56.0772 21.3303 55.5492 24.868C54.7363 30.3152 54.8669 32.7527 55.1862 33.3124C55.3319 33.5678 55.9038 33.2914 59.0119 30.167C62.12 27.0427 67.8644 20.9577 70.9437 17.725C74.023 14.4923 74.263 14.2964 74.2544 14.7083C74.2458 15.1203 73.9812 16.146 73.1334 18.6838C72.2855 21.2216 70.8624 25.2402 69.8711 28.5328C68.1611 34.213 67.7724 37.4653 67.792 38.5786C67.7998 39.0226 68.0896 39.1925 68.7304 38.8225C69.3712 38.4525 70.4272 37.5301 74.3347 33.3241C78.2423 29.1181 84.9692 21.6564 88.3744 18.2915C91.7795 14.9266 91.659 15.8847 90.9733 18.1997C89.1945 24.2054 87.6318 28.4443 87.8993 29.0281C89.2007 28.6299 91.3884 27.2006 93.9354 25.362C95.2322 24.4904 96.5381 23.7437 97.8835 22.9744',
  },
  waves: {
    viewBox: '0 0 118 50',
    strokeWidth: 20,
    d: 'M10.0026 28.3845C10.3626 27.5178 13.4421 23.295 17.5631 18.5535C20.2479 15.4643 21.916 14.5327 22.5207 14.3087C22.82 14.1979 23.1373 14.1965 23.4246 14.3731C24.088 14.7806 24.3826 15.9723 24.9115 20.1046C25.3562 23.5796 25.8915 29.8842 26.2935 33.3699C26.7531 37.3558 27.3207 38.1769 27.894 38.7486C28.1749 39.0288 28.5994 39.096 29.1168 38.9716C29.6342 38.8472 30.2736 38.4798 34.0299 34.1763C37.7863 29.8729 44.6402 21.6445 48.4677 17.1159C52.8283 11.9564 53.8355 11.1475 54.5241 10.746C54.8514 10.5552 55.2366 10.6027 55.5122 10.8074C56.13 11.2662 56.3319 12.8255 56.8093 18.2382C57.2004 22.6725 57.5283 30.5615 57.894 34.6759C58.2597 38.7903 58.5597 38.8982 62.3473 33.9052C66.135 28.9122 73.4011 18.815 77.2441 13.8562C81.0872 8.89747 81.287 9.38312 81.2971 11.6259C81.3252 17.8562 81.01 22.5101 81.224 23.5274C81.408 24.4018 81.9452 24.9346 82.3972 25.2596C82.6221 25.4213 82.9183 25.4465 83.2852 25.399C84.1189 25.2911 85.3076 24.342 87.5569 22.0366C94.2851 15.1403 95.2521 13.9451 95.7144 13.9999C99.8256 14.4872 96.3545 23.6518 96.5521 24.0974C96.6559 24.3314 96.9943 24.443 97.3887 24.4395C100.812 23.1401 105.236 21.0796 105.959 20.936C106.353 20.8716 106.801 20.8245 107.262 20.7761',
  },
  bumps: {
    viewBox: '0 0 98 51',
    strokeWidth: 20,
    d: 'M10.0001 31.8999C10.207 31.675 13.3393 28.0977 17.9698 23.0364C19.4994 21.3645 19.6668 21.8033 19.7249 24.7544C19.783 27.7055 19.8043 33.2297 19.8636 36.2531C19.9229 39.2765 20.0196 39.6317 20.2023 39.8554C20.3851 40.0791 20.6509 40.1606 21.0634 39.9748C21.4759 39.789 22.027 39.3333 24.0508 36.4502C26.0746 33.567 29.5544 28.2703 31.4681 25.5715C33.3817 22.8726 33.6238 22.9323 33.9089 23.8983C35.4352 29.0693 35.5348 30.5641 36.0101 31.1254C36.2379 31.3944 36.6385 31.4234 37.1862 31.2338C37.7339 31.0442 38.4677 30.5821 42.2704 27.0982C46.0731 23.6143 52.9226 17.1225 56.6476 13.6547C60.3727 10.1869 60.7659 9.93975 61.0255 10.0122C61.6054 10.1741 61.3233 12.187 60.2917 17.0543C59.5301 20.6476 57.9762 26.4529 57.3247 29.3493C56.6733 32.2458 56.8924 32.0398 58.6863 29.6223C60.4801 27.2048 63.842 22.5819 65.5954 20.3866C67.3489 18.1914 67.3921 18.564 66.6773 21.0852C65.9625 23.6065 64.4885 28.2651 63.6769 30.9372C62.8654 33.6093 62.761 34.1536 62.9677 34.2907C63.5869 34.7015 67.2089 30.8398 71.8236 26.2178C73.4493 24.5895 73.6716 24.4684 74.105 24.5875C76.4078 25.2206 78.4218 25.8442 81.1276 25.4604C82.3364 25.2889 83.2574 24.859 84.0297 24.7792C84.401 24.7409 84.7384 24.8464 84.9233 25.1627C85.1082 25.4789 85.1324 26.0384 85.4031 26.2977C85.6739 26.5571 86.1905 26.4994 86.6166 26.4268C87.0427 26.3542 87.3627 26.2685 87.6924 26.1802',
  },
};

const HINT_ARROWS = {
  'curve-right': {
    width: 54,
    height: 34,
    viewBox: '0 0 27 17',
    paths: [
      'M0.500122 0.500244C0.641852 0.912715 2.71482 3.22199 6.56575 6.81723C10.5913 10.5755 14.2039 12.4234 16.1056 13.3459C17.8952 14.0583 19.553 14.5135 21.5345 14.7562C22.7437 14.8528 24.3664 14.8953 26.1609 15.0417',
      'M21.622 16.1366C21.6921 16.1366 23.4294 16.1366 25.9053 16.0009C26.6906 15.9578 26.4766 15.5938 26.0332 15.1835C24.9124 14.2321 23.8243 13.2416 23.0939 12.488C22.7538 12.1677 22.4758 11.9733 22.1894 11.7729',
    ],
  },
  'down-left': {
    width: 22,
    height: 76,
    viewBox: '0 0 11 38',
    paths: [
      'M10.2578 0.284805C10.2578 0.28255 10.2578 0.280294 10.2357 2.70611C10.2137 5.13193 10.1695 9.9859 10.0507 13.1532C9.93195 16.3205 9.73988 17.654 9.2945 19.4699C8.28694 23.5778 6.56002 27.6754 4.77999 31.0473C3.88232 32.6134 2.99609 33.8854 2.44883 34.6359C1.90157 35.3864 1.72014 35.5769 1.5332 35.7731',
      'M0.5 30.0559C0.5 30.073 0.5 32.488 0.562117 36.0715C0.58255 37.2504 0.748467 37.1245 1.51396 36.6234C3.68243 35.2484 5.23234 34.2631 5.40368 34.0712C5.4706 33.9639 5.49687 33.8368 5.55371 33.7058',
    ],
  },
  'swoop-right': {
    width: 52,
    height: 48,
    viewBox: '0 0 26 24',
    paths: [
      'M0.5 0.5C0.5 1.10328 0.544312 3.24437 0.688794 6.30285C0.77452 8.11753 1.72307 9.86621 2.92831 11.9357C3.85566 13.528 5.29435 14.5162 6.80665 15.5605C7.59915 16.1078 8.51603 16.5798 9.86801 17.1722C11.22 17.7646 12.9981 18.4349 14.6709 18.9034C16.3438 19.3719 17.8574 19.6182 18.9634 19.7564C20.7218 19.9172 22.1702 19.8408 23.4813 19.6461C24.0162 19.551 24.2862 19.4634 24.6812 19.334L22.1592 18.2471C22.1554 18.2471 22.1515 18.2471 22.9036 18.2471C23.6557 18.2471 25.1639 18.2471 25.3384 18.9961C25.5129 19.7451 24.3079 21.2432 23.0665 22.7866',
    ],
  },
};

const HINT_BLOB_KEYS = Object.keys(HINT_BLOBS);
const HINT_ARROW_KEYS = Object.keys(HINT_ARROWS);

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function Hint({ text, blob, arrow, visible = true, className = '', style, portal = true }) {
  const [randomBlob] = useState(() => pickRandom(HINT_BLOB_KEYS));
  const [randomArrow] = useState(() => pickRandom(HINT_ARROW_KEYS));
  const blobDef = HINT_BLOBS[blob ?? randomBlob];
  const arrowDef = arrow === false ? null : HINT_ARROWS[arrow ?? randomArrow];
  const pathRef = useRef(null);
  const [pathLen, setPathLen] = useState(0);
  useEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const svg = path.ownerSVGElement;
    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width / svg.viewBox.baseVal.width;
    const scaleY = rect.height / svg.viewBox.baseVal.height;
    setPathLen(path.getTotalLength() * Math.max(scaleX, scaleY));
  }, [blobDef]);
  const content = (
    <div className={`sc-hint ${!visible ? 'sc-hint-hidden' : ''} ${className}`} style={style}>
      <div className="sc-hint-row">
        <span className="sc-hint-text-wrap">
          <svg className="sc-hint-blob" viewBox={blobDef.viewBox} preserveAspectRatio="none" fill="none">
            <path
              ref={pathRef}
              d={blobDef.d}
              stroke="var(--bg-surface-secondary)"
              strokeWidth={blobDef.strokeWidth}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={pathLen ? { strokeDasharray: pathLen, strokeDashoffset: pathLen, animation: 'sc-blob-draw 2s ease-in-out 1s forwards' } : { opacity: 0 }}
            />
          </svg>
          <span className="sc-hint-text">{text}</span>
        </span>
        {arrowDef && (
          <svg className="sc-hint-arrow" width={arrowDef.width} height={arrowDef.height} viewBox={arrowDef.viewBox} fill="none">
            {arrowDef.paths.map((d, i) => (
              <path key={i} d={d} stroke="var(--bg-surface-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </svg>
        )}
      </div>
    </div>
  );
  return portal ? ReactDOM.createPortal(content, document.body) : content;
}

function useTargetHintStyle(targetRef, active, offset = { top: -30, left: 'center' }, transform = 'translate(-100%, -100%) translateX(40px)') {
  const [style, setStyle] = useState(null);
  useEffect(() => {
    if (!active || !targetRef.current) return;
    const update = () => {
      if (!targetRef.current) return;
      const rect = targetRef.current.getBoundingClientRect();
      const left = offset.left === 'center' ? rect.left + rect.width / 2 : rect.left + offset.left;
      setStyle({
        top: rect.top + window.pageYOffset + offset.top,
        left: left + window.pageXOffset,
        transform,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [active]);
  return style;
}

function ShowcaseMapInner({ initialFloor = 'R&D', embedded = false, autoKnock = false, spotifyAlwaysOpen = false, githubAlwaysOpen = false, hideOnIt = false, themeOverride = null }) {
  const [themeState, setThemeState] = useState('dark');
  const theme = themeOverride || themeState;
  const setTheme = themeOverride ? () => {} : setThemeState;
  const [layout, setLayout] = useState('v2');
  const [activeFloor, setActiveFloor] = useState(initialFloor);
  const [floorTransition, setFloorTransition] = useState('visible'); // 'visible' | 'out' | 'in'

  const switchFloor = (floorName) => {
    if (floorName === activeFloor || floorTransition !== 'visible') return;
    setFloorTransition('out');
    setTimeout(() => {
      setActiveFloor(floorName);
      setFloorTransition('in');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFloorTransition('visible');
        });
      });
    }, 200);
  };
  const [navLogoVisible, setNavLogoVisible] = useState(false);
  const [showGrid, setShowGrid] = useState(() => {
    try { return localStorage.getItem('showGrid') === 'true'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('showGrid', showGrid); } catch {}
  }, [showGrid]);
  useEffect(() => {
    const handler = () => setShowGrid(g => !g);
    const syncHandler = (e) => { if (e.key === 'showGrid') setShowGrid(e.newValue === 'true'); };
    window.addEventListener('toggle-grid', handler);
    window.addEventListener('storage', syncHandler);
    return () => {
      window.removeEventListener('toggle-grid', handler);
      window.removeEventListener('storage', syncHandler);
    };
  }, []);
  const [activeVibes, setActiveVibes] = useState({});
  const miniRoamRef = useRef(null);
  const [storyViewer, setStoryViewer] = useState(null); // { stories, initialIndex }
  const [shareOpen, setShareOpen] = useState(false);
  const [viewedStories, setViewedStories] = useState({});
  // People movement — occasionally move someone between offices and meeting rooms
  const [movements, setMovements] = useState({ removed: {}, added: {}, anim: {} }); // anim: { roomId: 'leaving' | 'arriving' }
  const [miniChats, setMiniChats] = useState([]);
  const { setMessages: setChatMessages } = useChat();

  const openOnItChat = () => {
    const chatId = 'on-it';
    setChatMessages(prev => {
      if (prev[chatId]) return prev;
      return {
        ...prev,
        [chatId]: {
          type: 'dm', name: 'On-It', subtitle: 'AI Executive Assistant',
          avatar: '/on-it-agent.png',
          messages: [
            { id: 1, self: false, text: "Hey Joe 👋 I'm On-It, your AI executive assistant." },
            { id: 2, self: false, text: "I can schedule meetings, watch for colleagues or events, draft follow-ups (internal or external), complete Magic Minutes action items for you, and tap into your team's templates + knowledge base." },
            { id: 3, self: false, text: "What can I help you with?" },
          ],
        },
      };
    });
    setMiniChats(prev => {
      if (prev.find(c => c.chatId === chatId)) {
        return prev.filter(c => c.chatId !== chatId);
      }
      const containerRect = miniRoamRef.current?.getBoundingClientRect();
      const containerW = containerRect?.width || 1000;
      const offset = prev.length * 330;
      const x = Math.max(10, containerW - 330 - offset);
      return [...prev, {
        personName: 'On-It',
        personAvatar: '/on-it-agent.png',
        chatId,
        position: { x, y: 150 },
      }];
    });
  };

  const openMiniChat = (person, e) => {
    const chatId = getChatIdForAvatar(person.avatar);
    if (!chatId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMiniChats(prev => {
      // Toggle off if already open
      if (prev.find(c => c.chatId === chatId)) {
        return prev.filter(c => c.chatId !== chatId);
      }
      // Pin to top-right of miniRoamOS, stacked horizontally
      const containerRect = miniRoamRef.current?.getBoundingClientRect();
      const containerW = containerRect?.width || 1000;
      const containerH = containerRect?.height || 800;
      const offset = prev.length * 330;
      let x = containerW - 330 - offset;
      // Wrap to next row if off-screen left
      if (x < 10) {
        const row = Math.floor((-x + 10) / containerW) + 1;
        x = containerW - 330 - (offset - row * Math.floor(containerW / 330) * 330);
        if (x < 10) x = 10;
      }
      return [...prev, {
        personName: person.fullName || person.name,
        personAvatar: person.avatar,
        chatId,
        position: { x: Math.max(10, x), y: 150 },
      }];
    });
  };

  const closeMiniChat = (chatId) => {
    setMiniChats(prev => prev.filter(c => c.chatId !== chatId));
  };

  useEffect(() => {
    if (autoKnock) return;
    const floor = FLOORS[activeFloor];
    const privateRooms = floor.filter(r => r.type === 'private' && r.people.length === 1 && !r.story);
    const meetingRooms = floor.filter(r => r.type === 'meeting' && r.people.length > 0);
    if (privateRooms.length === 0 || meetingRooms.length === 0) return;
    const timers = [];
    const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); };

    const mergeAnim = (updates) => setMovements(prev => ({ ...prev, anim: { ...prev.anim, ...updates } }));
    const mergeRemovedAdded = (removed, added) => setMovements(prev => ({
      ...prev,
      removed: { ...prev.removed, ...removed },
      added: { ...prev.added, ...added },
    }));
    const clearKeys = (animKeys = [], removedKeys = [], addedKeys = []) => setMovements(prev => {
      const anim = { ...prev.anim };
      const removed = { ...prev.removed };
      const added = { ...prev.added };
      animKeys.forEach(k => delete anim[k]);
      removedKeys.forEach(k => delete removed[k]);
      addedKeys.forEach(k => delete added[k]);
      return { anim, removed, added };
    });

    const inUse = new Set();
    const tick = () => {
      const availableSources = privateRooms.filter(r => !inUse.has(r.id));
      const availableDests = meetingRooms.filter(r => !inUse.has(r.id));
      if (availableSources.length === 0 || availableDests.length === 0) return;
      const srcRoom = availableSources[Math.floor(Math.random() * availableSources.length)];
      const dstRoom = availableDests[Math.floor(Math.random() * availableDests.length)];
      const person = srcRoom.people[0];
      inUse.add(srcRoom.id);
      inUse.add(dstRoom.id);

      // 1. Leaving source
      mergeAnim({ [srcRoom.id]: 'leaving' });
      t(() => {
        // 2. Remove from source, add to dest with arriving animation
        mergeRemovedAdded({ [srcRoom.id]: true }, { [dstRoom.id]: person });
        clearKeys([srcRoom.id]);
        mergeAnim({ [dstRoom.id]: 'arriving' });
        t(() => {
          clearKeys([dstRoom.id]);
          t(() => {
            // 4. Leave destination
            mergeAnim({ [dstRoom.id]: 'leaving-added' });
            t(() => {
              // 5. Remove from dest, restore source with arriving animation
              clearKeys([dstRoom.id], [srcRoom.id], [dstRoom.id]);
              mergeAnim({ [srcRoom.id]: 'arriving' });
              t(() => {
                clearKeys([srcRoom.id]);
                inUse.delete(srcRoom.id);
                inUse.delete(dstRoom.id);
              }, 400);
            }, 300);
          }, 6000 + Math.random() * 6000);
        }, 400);
      }, 300);
    };

    // Fire frequently so many people are in motion at once
    const interval = setInterval(tick, 2500 + Math.random() * 1500);
    t(tick, 500);
    t(tick, 1800);
    t(tick, 3200);
    t(tick, 4600);

    // Group tick: batch of people enter/leave Morning Huddle together
    const groupTargets = meetingRooms.filter(r => /huddle/i.test(r.name));
    const groupTick = () => {
      if (groupTargets.length === 0) return;
      const dstRoom = groupTargets[Math.floor(Math.random() * groupTargets.length)];
      if (inUse.has(dstRoom.id)) return;
      const availableSources = privateRooms.filter(r => !inUse.has(r.id));
      if (availableSources.length < 3) return;
      const groupSize = Math.min(availableSources.length, 3 + Math.floor(Math.random() * 3));
      const shuffled = [...availableSources].sort(() => Math.random() - 0.5).slice(0, groupSize);
      const people = shuffled.map(r => r.people[0]);
      shuffled.forEach(r => inUse.add(r.id));
      inUse.add(dstRoom.id);

      // 1. All sources leave simultaneously
      const leavingAnim = {};
      shuffled.forEach(r => { leavingAnim[r.id] = 'leaving'; });
      mergeAnim(leavingAnim);

      t(() => {
        // 2. Remove from sources, add all to destination, destination plays arriving
        const removed = {};
        shuffled.forEach(r => { removed[r.id] = true; });
        mergeRemovedAdded(removed, { [dstRoom.id]: people });
        clearKeys(shuffled.map(r => r.id));
        mergeAnim({ [dstRoom.id]: 'arriving' });
        t(() => {
          clearKeys([dstRoom.id]);
          t(() => {
            // 4. Leave destination
            mergeAnim({ [dstRoom.id]: 'leaving-added' });
            t(() => {
              // 5. Remove from dest, restore all sources simultaneously
              clearKeys([dstRoom.id], shuffled.map(r => r.id), [dstRoom.id]);
              const arrivingAnim = {};
              shuffled.forEach(r => { arrivingAnim[r.id] = 'arriving'; });
              mergeAnim(arrivingAnim);
              t(() => {
                clearKeys(shuffled.map(r => r.id));
                shuffled.forEach(r => inUse.delete(r.id));
                inUse.delete(dstRoom.id);
              }, 400);
            }, 300);
          }, 7000 + Math.random() * 5000);
        }, 400);
      }, 300);
    };

    const groupInterval = setInterval(groupTick, 10000 + Math.random() * 4000);
    t(groupTick, 2500);
    return () => { clearInterval(interval); clearInterval(groupInterval); timers.forEach(clearTimeout); };
  }, [activeFloor, autoKnock]);

  // Auto-knock cycle: rotates through private offices showing the knock dialog
  useEffect(() => {
    if (!autoKnock) return;
    const floor = FLOORS[activeFloor];
    const privateRooms = floor.filter(r => r.type === 'private' && r.people.length === 1);
    if (privateRooms.length === 0) return;
    const timers = [];
    let lastIdx = -1;
    const cycle = () => {
      let idx;
      do { idx = Math.floor(Math.random() * privateRooms.length); } while (idx === lastIdx && privateRooms.length > 1);
      lastIdx = idx;
      const room = privateRooms[idx];
      setKnockingRoom(room);
      // Hold the knock dialog
      timers.push(setTimeout(() => {
        setKnockingRoom(null);
        // Briefly enter the room (highlights it as joined)
        setJoinedRoomId(room.id);
        timers.push(setTimeout(() => {
          setJoinedRoomId(null);
          // Wait, then knock on the next person
          timers.push(setTimeout(cycle, 1200));
        }, 2200));
      }, 2400));
    };
    const startId = setTimeout(cycle, 800);
    timers.push(startId);
    return () => {
      timers.forEach(clearTimeout);
      setKnockingRoom(null);
      setJoinedRoomId(null);
    };
  }, [autoKnock, activeFloor]);

  // Apply movements to get the current floor rooms
  const currentFloorRooms = useMemo(() => {
    return FLOORS[activeFloor].map(room => {
      let people = room.people;
      if (movements.removed[room.id]) people = [];
      if (movements.added[room.id]) {
        const incoming = Array.isArray(movements.added[room.id]) ? movements.added[room.id] : [movements.added[room.id]];
        people = [...people, ...incoming.map(p => ({ ...p, _new: true }))];
      }
      return { ...room, people, _anim: movements.anim[room.id] || null };
    });
  }, [activeFloor, movements]);

  const theaterSpeakers = useMemo(() => [p('Camila T.'), p('Megan T.')], []);
  const speakerStories = {};

  const allStoryRooms = useMemo(() => {
    const rooms = [];
    FLOOR_NAMES.forEach(floor => {
      FLOORS[floor].forEach(r => {
        if (r.story && r.people[0]) rooms.push(r);
      });
    });
    return rooms;
  }, []);

  const allStoriesData = useMemo(() =>
    allStoryRooms.map(r => ({ image: r.story, avatar: r.people[0].avatar, name: r.people[0].fullName || r.people[0].name })),
  [allStoryRooms]);

  const mapWin = useWindow('map');
  const ainboxWin = useWindow('ainbox');
  const onairWin = useWindow('onair');
  const meetingWin = useWindow('meeting');
  const theaterWin = useWindow('theater');
  const shelfWin = useWindow('shelf');
  const magicastWin = useWindow('magicast');
  const magicminutesWin = useWindow('magicminutes');
  const recordingsWin = useWindow('recordings');
  const lobbyWin = useWindow('lobby');
  const mobileWin = useWindow('mobile');
  const [activeMeetingRoom, setActiveMeetingRoom] = useState(null);
  const [joinedRoomId, setJoinedRoomId] = useState(null);
  const [knockingRoom, setKnockingRoom] = useState(null);
  const [homecomingId, setHomecomingId] = useState(null);
  const knockTimerRef = useRef(null);
  const suppressHomeRef = useRef(false);
  const knockOnHoward = useCallback(() => {
    const howardRoom = FLOORS['R&D'].find(r => r.id === 'r4');
    if (!howardRoom) return;
    if (knockingRoom) {
      clearTimeout(knockTimerRef.current);
      setKnockingRoom(null);
      return;
    }
    if (activeFloor !== 'R&D') setActiveFloor('R&D');
    if (joinedRoomId === howardRoom.id) return;
    setKnockingRoom(howardRoom);
    knockTimerRef.current = setTimeout(() => {
      setKnockingRoom(null);
      if (meetingWin.isOpen || theaterWin.isOpen) suppressHomeRef.current = true;
      if (meetingWin.isOpen) meetingWin.close();
      if (theaterWin.isOpen) theaterWin.close();
      setJoinedRoomId(howardRoom.id);
    }, 3000);
  }, [activeFloor, knockingRoom, joinedRoomId, meetingWin, theaterWin]);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [pipPos, setPipPos] = useState(null);
  const [magicastShape, setMagicastShape] = useState('circle');
  const [shelfClosing, setShelfClosing] = useState(false);
  const [mapPulse, setMapPulse] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [introHintStyle, setIntroHintStyle] = useState(null);
  useEffect(() => {
    const update = () => {
      if (!windowRef.current || !miniRoamRef.current) return;
      const wRect = windowRef.current.getBoundingClientRect();
      const mRect = miniRoamRef.current.getBoundingClientRect();
      setIntroHintStyle({
        top: wRect.top - mRect.top + 22,
        left: wRect.left - mRect.left - 60,
      });
    };
    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    const ro = new ResizeObserver(update);
    if (miniRoamRef.current) ro.observe(miniRoamRef.current);
    if (windowRef.current) ro.observe(windowRef.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, [mapWin.position.x, mapWin.position.y, layout]);
  const [mapMounted, setMapMounted] = useState(false);
  const [wallpaperLoaded, setWallpaperLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMapMounted(true), 500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const src = theme === 'light' ? '/wallpapers/wallpaper-light.png' : '/wallpapers/wallpaper-dark.png';
    const img = new Image();
    img.onload = () => setWallpaperLoaded(true);
    img.src = src;
  }, []);
  const pulseMapWindow = useCallback(() => {
    setMapPulse(false);
    requestAnimationFrame(() => {
      setMapPulse(true);
      setTimeout(() => setMapPulse(false), 720);
    });
  }, []);
  const shelfActive = shelfOpen || shelfClosing;
  const [pipClosing, setPipClosing] = useState(false);
  const wasMagicastOpenRef2 = useRef(false);
  useEffect(() => {
    if (wasMagicastOpenRef2.current && !magicastWin.isOpen) {
      setPipClosing(true);
      setTimeout(() => setPipClosing(false), 200);
    }
    wasMagicastOpenRef2.current = magicastWin.isOpen;
  }, [magicastWin.isOpen]);
  const closeShelf = useCallback(() => {
    if (!shelfOpen) return;
    setShelfOpen(false);
    setShelfClosing(true);
    setTimeout(() => setShelfClosing(false), 220);
  }, [shelfOpen]);
  const [shelfPhotoIdx, setShelfPhotoIdx] = useState(1);
  const [shelfDir, setShelfDir] = useState(null);
  const openShelfPhoto = useCallback((idx) => {
    setShelfDir(null);
    setShelfPhotoIdx(idx);
    shelfWin.open();
  }, [shelfWin]);
  const prevShelfPhoto = useCallback(() => {
    setShelfDir('prev');
    setShelfPhotoIdx(i => (i - 2 + SHELF_TOTAL) % SHELF_TOTAL + 1);
  }, []);
  const nextShelfPhoto = useCallback(() => {
    setShelfDir('next');
    setShelfPhotoIdx(i => i % SHELF_TOTAL + 1);
  }, []);

  // If meeting or theater window closes while Joe is in that room, send him home
  const sendHome = useCallback(() => {
    setJoinedRoomId(null);
    const joeOffice = (FLOORS[activeFloor] || []).find(r => r.type === 'private' && r.people.some(p => p.avatar === JOE.avatar));
    if (joeOffice) {
      setHomecomingId(joeOffice.id);
      setTimeout(() => setHomecomingId(null), 700);
    }
  }, [activeFloor]);

  const wasMeetingOpenRef = useRef(false);
  useEffect(() => {
    if (wasMeetingOpenRef.current && !meetingWin.isOpen) {
      if (suppressHomeRef.current) suppressHomeRef.current = false;
      else sendHome();
    }
    wasMeetingOpenRef.current = meetingWin.isOpen;
  }, [meetingWin.isOpen, sendHome]);

  const wasTheaterOpenRef = useRef(false);
  useEffect(() => {
    if (wasTheaterOpenRef.current && !theaterWin.isOpen) {
      if (suppressHomeRef.current) suppressHomeRef.current = false;
      else sendHome();
    }
    wasTheaterOpenRef.current = theaterWin.isOpen;
  }, [theaterWin.isOpen, sendHome]);

  useEffect(() => {
    if (!shelfWin.isOpen || !shelfWin.isFocused) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevShelfPhoto(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); nextShelfPhoto(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shelfWin.isOpen, shelfWin.isFocused, prevShelfPhoto, nextShelfPhoto]);

  // Preload all shelf photos when the window opens so nav is instant
  useEffect(() => {
    if (!shelfWin.isOpen) return;
    const imgs = [];
    for (let i = 1; i <= SHELF_TOTAL; i++) {
      const img = new Image();
      img.src = `/shelf/photos/photo-${i}.png`;
      imgs.push(img);
    }
  }, [shelfWin.isOpen]);
  const JOE = { name: 'Ava L.', fullName: 'Ava Lee', avatar: '/headshots/joe-woodward.jpg' };

  const makeDragHandler = (win) => (e) => {
    if (e.target.closest('.sc-traffic-lights') || e.target.closest('.ainbox-traffic-lights') || e.target.closest('.sc-theme-toggle')) return;
    e.preventDefault();
    win.focus();
    const startX = e.clientX, startY = e.clientY;
    const startPos = { ...win.position };
    const onMove = (e) => {
      win.move({ x: startPos.x + e.clientX - startX, y: startPos.y + e.clientY - startY });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Randomly cycle vibe coding — spread across private rooms all over the floor
  useEffect(() => {
    if (spotifyAlwaysOpen || githubAlwaysOpen) return; // feature-preview maps: no vibes
    const privateRooms = currentFloorRooms.filter(
      r => r.type === 'private' && r.people.length === 1
    );
    if (privateRooms.length < 2) return;
    const timers = [];
    const MAX_VIBES = Math.min(8, Math.max(3, Math.round(privateRooms.length * 0.25)));
    const MIN_VIBES = Math.min(3, Math.max(2, Math.round(privateRooms.length * 0.12)));
    const SEED_COUNT = MAX_VIBES;

    // Start a vibe on a random room, then stop it after a random duration
    const startVibe = () => {
      setActiveVibes(prev => {
        const activeIds = Object.keys(prev);
        if (activeIds.length >= MAX_VIBES) return prev;
        const available = privateRooms.filter(r => !prev[r.id]);
        if (available.length === 0) return prev;
        const room = available[Math.floor(Math.random() * available.length)];
        // Always have all 3 vibe types visible — pick whichever is currently least represented
        const counts = { claude: 0, codex: 0, both: 0 };
        Object.values(prev).forEach(v => { if (counts[v] != null) counts[v]++; });
        const minCount = Math.min(counts.claude, counts.codex, counts.both);
        const candidates = Object.keys(counts).filter(k => counts[k] === minCount);
        const type = candidates[Math.floor(Math.random() * candidates.length)];
        return { ...prev, [room.id]: type };
      });
    };

    const stopRandomVibe = () => {
      setActiveVibes(prev => {
        const activeIds = Object.keys(prev);
        if (activeIds.length <= MIN_VIBES) return prev;
        const removeId = activeIds[Math.floor(Math.random() * activeIds.length)];
        const next = { ...prev };
        delete next[removeId];
        return next;
      });
    };

    // Schedule starts and stops independently
    const scheduleStart = () => {
      const delay = 3000 + Math.random() * 5000;
      timers.push(setTimeout(() => { startVibe(); scheduleStart(); }, delay));
    };

    const scheduleStop = () => {
      const delay = 6000 + Math.random() * 9000;
      timers.push(setTimeout(() => { stopRandomVibe(); scheduleStop(); }, delay));
    };

    // Seed with initial vibes staggered across the floor
    for (let i = 0; i < SEED_COUNT; i++) {
      const delay = i === 0 ? 0 : 200 + i * (250 + Math.random() * 400);
      if (delay === 0) startVibe();
      else timers.push(setTimeout(startVibe, delay));
    }

    scheduleStart();
    scheduleStop();

    return () => timers.forEach(t => clearTimeout(t));
  }, [activeFloor]);
  const windowRef = useRef(null);
  const viewportRef = useRef(null);
  const productsBarRef = useRef(null);

  useEffect(() => {
    if (themeOverride) return; // parent controls the global data-theme
    const html = document.documentElement;
    html.classList.add('theme-switching');
    html.setAttribute('data-theme', theme);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => html.classList.remove('theme-switching'));
    });
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('theme-switching');
      html.removeAttribute('data-theme');
    };
  }, [theme, themeOverride]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onScroll = () => {
      setNavLogoVisible(viewport.scrollTop >= 200);
    };
    viewport.addEventListener('scroll', onScroll);
    return () => viewport.removeEventListener('scroll', onScroll);
  }, []);

  const marqueeLogos = [
    { src: '/marquee/logo-wistia.svg', alt: 'Wistia', w: 110, h: 24 },
    { src: '/marquee/logo-omni.svg', alt: 'Omni Analytics', w: 71, h: 28 },
    { src: '/marquee/logo-customer-io.svg', alt: 'Customer.io', w: 174, h: 24 },
    { src: '/marquee/logo-deepgram.svg', alt: 'Deepgram', w: 130, h: 30 },
    { src: '/marquee/logo-flex.svg', alt: 'Flex', w: 63, h: 24 },
    { src: '/marquee/logo-givecampus.svg', alt: 'GiveCampus', w: 149, h: 17 },
    { src: '/marquee/logo-pulley.svg', alt: 'Pulley', w: 90, h: 28 },
    { src: '/marquee/logo-keep.svg', alt: 'Keep', w: 84, h: 24 },
    { src: '/marquee/logo-real.svg', alt: 'Real', w: 71, h: 30 },
    { src: '/marquee/logo-sonsie.svg', alt: 'Sonsie', w: 98, h: 24 },
    { src: '/marquee/logo-nofraud.svg', alt: 'NoFraud', w: 128, h: 24 },
    { src: '/marquee/logo-mpire.svg', alt: 'Mpire Financial', w: 81, h: 40 },
    { src: '/marquee/logo-frida.svg', alt: 'Fridababy', w: 70, h: 28 },
  ];
  const marqueeEl = (
    <div className="sc-marquee">
      <div className="sc-marquee-track">
        {Array.from({ length: 2 }).map((_, copy) => (
          <div key={copy} className="sc-marquee-group" aria-hidden={copy === 1 ? 'true' : undefined}>
            {marqueeLogos.map(l => (
              <span
                key={l.src}
                className="sc-marquee-logo"
                role="img"
                aria-label={l.alt}
                style={{ width: l.w, height: l.h, WebkitMaskImage: `url(${l.src})`, maskImage: `url(${l.src})` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="sc-viewport" data-theme={theme} data-layout={layout} ref={viewportRef}>
      {/* Debug grid overlay */}
      {showGrid && <div className="sc-grid-debug">
        {Array.from({ length: 12 }).map((_, i) => <div key={i} className="sc-grid-debug-col" />)}
      </div>}
      {/* Website navbar */}
      <div className="sc-navbar-wrap" data-logo-visible={navLogoVisible} style={HIDE_CHROME ? { display: 'none' } : undefined}>
        <div className="sc-platform-badge" aria-hidden={navLogoVisible}>
          <span className="sc-platform-badge-text">INTELLIGENT VIRTUAL OFFICE</span>
        </div>
        <Navbar />
      </div>

      <div className="miniRoamOS" ref={miniRoamRef} onClick={() => hintVisible && setHintVisible(false)}>
        <div className="sc-wallpaper sc-wallpaper-dark" style={{ opacity: theme === 'dark' && wallpaperLoaded ? 1 : 0 }} />
        <div className="sc-wallpaper sc-wallpaper-light" style={{ opacity: theme === 'light' && wallpaperLoaded ? 1 : 0 }} />
        {layout === 'v2' && (
          <div className="sc-v2-hero">
            <img className="sc-v2-hero-icon" src="/icons/roam-gold-icon.png" alt="Roam" />
            <h1 className="sc-v2-hero-title">Virtual Office that Thinks</h1>
            <div className="sc-v2-hero-rating" aria-label="G2 rating 4.8 out of 5">
              <span
                className="sc-v2-hero-rating-g2"
                aria-hidden="true"
                style={{ WebkitMaskImage: 'url(/icons/social/g2.svg)', maskImage: 'url(/icons/social/g2.svg)' }}
              />
              <span className="sc-v2-hero-rating-stars" aria-hidden="true">
                {[0, 1, 2, 3, 4].map(i => (
                  <span
                    key={i}
                    className="sc-v2-hero-rating-star"
                    style={{ WebkitMaskImage: 'url(/icons/star-fill.svg)', maskImage: 'url(/icons/star-fill.svg)' }}
                  />
                ))}
              </span>
              <span className="sc-v2-hero-rating-score">4.8/5</span>
            </div>
            <p className="sc-v2-hero-subtitle">Roam is a Virtual Office Platform where remote work happens in the open and every action makes your company smarter.</p>
            <div className="sc-v2-hero-buttons">
              <button className="sc-promo-btn">Book Demo</button>
              <button className="sc-promo-btn">Free Trial</button>
            </div>
          </div>
        )}
        {layout === 'v2' && (
          <div className="sc-v2-hero-marquee">{marqueeEl}</div>
        )}
      <div className={`sc-window ${!mapWin.isFocused ? 'sc-window-unfocused' : ''} ${mapMounted ? 'sc-window-mounted' : ''} ${mapPulse ? 'sc-window-pulse' : ''}`} ref={windowRef} style={{ transform: `translate(${mapWin.position.x}px, ${mapWin.position.y}px)`, zIndex: mapWin.zIndex }} onMouseDown={() => mapWin.focus()}>
        {/* Mac window title bar */}
        <div className="sc-titlebar" onMouseDown={(e) => { setHintVisible(false); makeDragHandler(mapWin)(e); }}>
          <div className="sc-traffic-lights">
            <div className="sc-light sc-light-close" />
            <div className="sc-light sc-light-minimize" />
            <div className="sc-light sc-light-maximize" />
          </div>
          <img className="sc-titlebar-logo" src="/icons/roam-logo.png" alt="roam" />
          <div className="sc-titlebar-spacer" />
          {!embedded && !hideOnIt && (
            <button
              type="button"
              className="sc-on-it-btn"
              onClick={(e) => { e.stopPropagation(); openOnItChat(); }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Chat with On-It"
            >
              <span className="sc-on-it-hex">
                <img src="/on-it-agent.png" alt="" />
              </span>
            </button>
          )}
        </div>

        {/* Main content area */}
        <div className="sc-content">
          {/* Map grid */}
          <div className="sc-map">
            <div className={`sc-grid sc-floor-${floorTransition}`}>
              {currentFloorRooms.map(room => {
                const gridColumn = room.colSpan
                  ? `${room.pos.col + 1} / span ${room.colSpan}`
                  : `${room.pos.col + 1}`;
                const gridRow = room.rowSpan
                  ? `${room.pos.row + 1} / span ${room.rowSpan}`
                  : `${room.pos.row + 1}`;

                return (
                  <div
                    key={room.id}
                    className={`sc-grid-cell ${room._anim ? `sc-move-${room._anim}` : ''} ${autoKnock && joinedRoomId === room.id ? 'sc-room-joined-pulse' : ''} ${joinedRoomId === room.id && room.type === 'private' && room.people.some(p => p.avatar === JOE.avatar) ? 'sc-room-own-office' : ''}`}
                    data-room-type={room.type}
                    data-room-name={room.name}
                    style={{ gridColumn, gridRow }}
                  >
                    {room.type === 'theater' ? (
                      <TheaterRoomCard
                        room={room}
                        speakers={theaterSpeakers}
                        onPersonClick={openMiniChat}
                        onRoomClick={() => theaterWin.open()}
                        speakerStories={speakerStories}
                        viewedStories={viewedStories}
                        onStoryClick={(storyImage) => {
                          const speaker = theaterSpeakers.find(s => speakerStories[s.name] === storyImage);
                          setViewedStories(prev => ({ ...prev, [storyImage]: true }));
                          setStoryViewer({
                            stories: [{ image: storyImage, avatar: speaker?.avatar, name: speaker?.fullName || speaker?.name }],
                            initialIndex: 0,
                          });
                        }}
                      />
                    ) : room.type === 'meeting' ? (
                      <MeetingRoomCardShowcase room={{ ...room, people: joinedRoomId === room.id && !room.people.some(p => p.avatar === JOE.avatar) ? [...room.people, { ...JOE, isJoining: true }] : room.people }} onPersonClick={openMiniChat} onRoomClick={(r) => { setJoinedRoomId(r.id); const ppl = r.people.some(p => p.avatar === JOE.avatar) ? r.people : [...r.people, JOE]; setActiveMeetingRoom({ ...r, people: ppl }); meetingWin.open(); }} />
                    ) : room.type === 'game' ? (
                      <GameRoomCard room={room} />
                    ) : room.type === 'command' ? (
                      <CommandCenterCard room={room} />
                    ) : (
                      <PrivateRoomCard
                        spotifyAlwaysOpen={spotifyAlwaysOpen}
                        githubAlwaysOpen={githubAlwaysOpen}
                        onPersonClick={openMiniChat}
                        onRoomClick={room.people.length === 0 ? undefined : (r) => {
                          if (joinedRoomId === r.id) return;
                          const isMyOffice = room.people.some(p => p.avatar === JOE.avatar);
                          if (isMyOffice) {
                            if (knockingRoom) {
                              clearTimeout(knockTimerRef.current);
                              setKnockingRoom(null);
                            }
                            if (meetingWin.isOpen) meetingWin.close();
                            if (theaterWin.isOpen) theaterWin.close();
                            setJoinedRoomId(null);
                            setHomecomingId(room.id);
                            setTimeout(() => setHomecomingId(null), 700);
                            return;
                          }
                          if (knockingRoom) return;
                          setKnockingRoom(r);
                          knockTimerRef.current = setTimeout(() => {
                            setKnockingRoom(null);
                            if (meetingWin.isOpen || theaterWin.isOpen) suppressHomeRef.current = true;
                            if (meetingWin.isOpen) meetingWin.close();
                            if (theaterWin.isOpen) theaterWin.close();
                            setJoinedRoomId(r.id);
                          }, 3000);
                        }}
                        room={{
                          ...room,
                          people: joinedRoomId === room.id && !room.people.some(p => p.avatar === JOE.avatar)
                            ? [...room.people, { ...JOE, isJoining: true }]
                            : joinedRoomId && joinedRoomId !== room.id
                              ? room.people.filter(p => p.avatar !== JOE.avatar)
                              : homecomingId === room.id
                                ? room.people.map(p => p.avatar === JOE.avatar ? { ...p, isJoining: true } : p)
                                : room.people,
                          vibe: activeVibes[room.id] || null,
                        }}
                        storyBubble={room.story && room.people[0] && !viewedStories[room.story] ? (
                          <SimpleStoryBubble
                            image={room.story}
                            delay={currentFloorRooms.filter(r => r.story).indexOf(room) * 3000 + 3000}
                            onClick={() => {
                              const clickedIndex = allStoriesData.findIndex(s => s.image === room.story);
                              const reordered = [...allStoriesData.slice(clickedIndex), ...allStoriesData.slice(0, clickedIndex)];
                              const viewed = {};
                              allStoryRooms.forEach(r => { viewed[r.story] = true; });
                              setViewedStories(prev => ({ ...prev, ...viewed }));
                              setStoryViewer({ stories: reordered, initialIndex: 0 });
                            }}
                          />
                        ) : null}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar — elevator */}
          <div className="sc-sidebar">
            {FLOOR_NAMES.map(floorName => (
              <FloorCard
                key={floorName}
                name={floorName}
                rooms={FLOORS[floorName]}
                active={activeFloor === floorName}
                onClick={() => switchFloor(floorName)}
              />
            ))}
          </div>
        </div>

        {/* Shelf overlay — dims the entire window behind the open shelf */}
        {shelfActive && <div className={`sc-shelf-overlay ${shelfClosing ? 'sc-shelf-overlay-closing' : ''}`} onClick={closeShelf} />}

        {/* Shelf — absolute-positioned, sits above the toolbar */}
        <div className={`sc-shelf-wrap ${shelfActive ? 'sc-shelf-wrap-open' : ''}`}>
            <div className={`sc-shelf ${shelfOpen ? 'sc-shelf-hidden' : ''}`}>
              <div className="sc-shelf-items">
                {[1, 2, 3, 4].map(idx => (
                  <div
                    key={idx}
                    className="sc-shelf-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => openShelfPhoto(idx)}
                  >
                    <img src={`/shelf/photos/photo-${idx}.png`} alt="" />
                  </div>
                ))}
              </div>
              <div className="sc-shelf-base" />
              <button className="sc-shelf-chevron" aria-label="Open shelf" onClick={() => setShelfOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            {shelfActive && (
              <div className={`sc-shelf-open ${shelfClosing ? 'sc-shelf-open-closing' : ''}`}>
                <div className="sc-shelf-open-header">
                  <div className="sc-shelf-open-pill">
                    <span className="sc-shelf-open-title">Joe's Shelf</span>
                    <div className="sc-shelf-open-avatars">
                      <img className="sc-shelf-open-avatar" src={JOE.avatar} alt="" />
                    </div>
                  </div>
                  <div className="sc-toolbar-pill sc-shelf-open-close" aria-label="Close shelf" onClick={closeShelf}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 7 7)"/></svg>
                  </div>
                </div>
                {(() => {
                  const SIZES = [
                    // Row 0 — 4 items
                    { w: 58, h: 46 }, { w: 44, h: 58 }, { w: 62, h: 44 }, { w: 48, h: 60 },
                    // Row 1 — 4 items
                    { w: 60, h: 48 }, { w: 52, h: 62 }, { w: 68, h: 44 }, { w: 56, h: 56 },
                    // Row 2 — 4 items
                    { w: 70, h: 52 }, { w: 48, h: 60 }, { w: 62, h: 44 }, { w: 58, h: 58 },
                  ];
                  const ROW_COUNTS = [4, 4, 4];
                  let startIdx = 0;
                  return ROW_COUNTS.map((count, rowIdx) => {
                    const rowStart = startIdx;
                    startIdx += count;
                    return (
                      <div key={rowIdx} className="sc-shelf-open-row">
                        <div className="sc-shelf-open-items">
                          {Array.from({ length: count }).map((_, i) => {
                            const idx = rowStart + i;
                            if (idx >= SIZES.length) return null;
                            const { w, h } = SIZES[idx];
                            const photoIdx = idx + 1;
                            return (
                              <div
                                key={i}
                                className="sc-shelf-item"
                                style={{ width: w, height: h, cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); openShelfPhoto(photoIdx); }}
                              >
                                <img src={`/shelf/photos/photo-${photoIdx}.png`} alt="" />
                              </div>
                            );
                          })}
                        </div>
                        <div className="sc-shelf-base" />
                      </div>
                    );
                  });
                })()}
              </div>
            )}
        </div>

        {/* Bottom toolbar — matches Figma */}
        <div className="sc-toolbar">
          {/* Left group */}
          <div className="sc-toolbar-group">
            <div className="sc-toolbar-pill" data-tooltip="AInbox" onClick={() => { ainboxWin.open(); }}>
              <img src="/icons/chat.svg" width="16" height="16" alt="" />
            </div>
          </div>

          {/* Center group */}
          <div className="sc-toolbar-pill-group">
            <div className="sc-toolbar-pill" data-tooltip="Access — Knock Required">
              <img src="/icons/door.svg" width="16" height="16" alt="" />
            </div>
            <div className="sc-toolbar-pill" data-tooltip="Microphone">
              <img src="/icons/microphone.svg" width="16" height="16" alt="" />
            </div>
            <div className="sc-toolbar-pill" data-tooltip="Screenshare" onClick={() => setShareOpen(true)}>
              <img src="/icons/screenshare.svg" width="16" height="16" alt="" />
            </div>
            <div className="sc-toolbar-pill sc-toolbar-pill-mm" data-tooltip="Magic Minutes">
              <img src="/icons/magic-quill.svg" width="16" height="16" alt="" />
            </div>
            {joinedRoomId && (
              <div className="sc-toolbar-pill sc-toolbar-pill-exit" data-tooltip="Leave Room" onClick={() => {
                if (meetingWin.isOpen) meetingWin.close();
                if (theaterWin.isOpen) theaterWin.close();
                sendHome();
              }}>
                <img src="/icons/door.svg" width="16" height="16" alt="" />
              </div>
            )}
          </div>

          {/* Right group */}
          <div className="sc-toolbar-group">
            <div className="sc-toolbar-pill-group">
              <div className="sc-toolbar-pill" data-tooltip="Story" onClick={() => {
                if (allStoriesData.length > 0) {
                  const viewed = {};
                  allStoryRooms.forEach(r => { viewed[r.story] = true; });
                  setViewedStories(prev => ({ ...prev, ...viewed }));
                  setStoryViewer({ stories: allStoriesData, initialIndex: 0 });
                }
              }}>
                <img src="/icons/story.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="Magicast" onClick={() => magicastWin.open()}>
                <img src="/icons/magicast.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="Recordings" onClick={() => recordingsWin.open()}>
                <img src="/icons/recordings.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="Lobby" onClick={() => lobbyWin.open()}>
                <img src="/icons/lobby.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="On-Air" onClick={() => onairWin.open()}>
                <img src="/icons/on-air.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="Calendar">
                <img src="/icons/calendar.svg" width="16" height="16" alt="" />
              </div>
            </div>
          </div>
        </div>
        {storyViewer && <StoryViewer stories={storyViewer.stories} initialIndex={storyViewer.initialIndex} onClose={() => setStoryViewer(null)} />}
        <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
        {knockingRoom && <KnockDialog room={knockingRoom} onCancel={() => { clearTimeout(knockTimerRef.current); setKnockingRoom(null); }} />}
      </div>
      {miniChats.map(mc => (
        <MiniChat key={mc.chatId} {...mc} onClose={() => closeMiniChat(mc.chatId)} />
      ))}
      {ainboxWin.isOpen && <AInbox win={ainboxWin} onDrag={makeDragHandler(ainboxWin)} onOpenMagicMinutes={() => magicminutesWin.open()} />}
      {onairWin.isOpen && <OnAir win={onairWin} onDrag={makeDragHandler(onairWin)} demo />}
      {meetingWin.isOpen && activeMeetingRoom && <MeetingWindow win={meetingWin} onDrag={makeDragHandler(meetingWin)} roomName={activeMeetingRoom.name} people={activeMeetingRoom.people} onOpenChat={() => ainboxWin.open()} onOpenOnAir={() => onairWin.open()} />}
      {theaterWin.isOpen && <TheaterWindow win={theaterWin} onDrag={makeDragHandler(theaterWin)} speakers={theaterSpeakers} audience={SHOWCASE_PEOPLE} me={JOE} onOpenChat={() => ainboxWin.open()} />}
      {shelfWin.isOpen && <ShelfWindow win={shelfWin} onDrag={makeDragHandler(shelfWin)} photoIdx={shelfPhotoIdx} direction={shelfDir} onPrev={prevShelfPhoto} onNext={nextShelfPhoto} />}
      {magicastWin.isOpen && <MagicastWindow win={magicastWin} onDrag={makeDragHandler(magicastWin)} pipPos={pipPos} shape={magicastShape} />}
      {magicastWin.isOpen && <MagicastBubble onPositionChange={setPipPos} shape={magicastShape} onShapeChange={setMagicastShape} />}
      {magicastWin.isOpen && <div className="mc-recording-border" />}
      {magicminutesWin.isOpen && <MagicMinutes win={magicminutesWin} onDrag={makeDragHandler(magicminutesWin)} />}
      {recordingsWin.isOpen && <Recordings win={recordingsWin} onDrag={makeDragHandler(recordingsWin)} />}
      {lobbyWin.isOpen && <Lobby win={lobbyWin} onDrag={makeDragHandler(lobbyWin)} />}
      {mobileWin.isOpen && <MobileWindow win={mobileWin} onDrag={makeDragHandler(mobileWin)} onOpenStories={() => {
        if (allStoriesData.length > 0) {
          const viewed = {};
          allStoryRooms.forEach(r => { viewed[r.story] = true; });
          setViewedStories(prev => ({ ...prev, ...viewed }));
          setStoryViewer({ stories: allStoriesData, initialIndex: 0 });
        }
      }} />}
      {/* Product features bar — inside miniRoamOS, pinned to bottom */}
      {/* Handwritten annotation pointing to the product bar */}
      <Hint portal={false} text="Product Tour" blob="peaks" arrow="swoop-right" visible={hintVisible} style={introHintStyle || { top: 190, left: 90 }} />
      <div className="sc-products-bar" ref={productsBarRef}>
        {PRODUCTS.map((item, i) => {
          const winByName = {
            'AInbox': ainboxWin,
            'On-Air': onairWin,
            'Theater': theaterWin,
            'Magicast': magicastWin,
            'Magic Minutes': magicminutesWin,
            'Lobby': lobbyWin,
            'Mobile': mobileWin,
          };
          const w = winByName[item.name];
          const isActive = w?.isOpen || false;
          const openMobileAboveButton = () => {
            if (mobileWin.isOpen) { mobileWin.requestClose(); return; }
            const btn = miniRoamRef.current?.querySelector('[data-label="Mobile"]');
            const container = miniRoamRef.current;
            if (container) {
              const cRect = container.getBoundingClientRect();
              const windowHeight = 690;
              const windowWidth = 300;
              const x = cRect.width - windowWidth - 56;
              const baseTop = btn ? (btn.getBoundingClientRect().top - cRect.top) : cRect.height;
              const y = baseTop - windowHeight - 12;
              mobileWin.move({ x: Math.max(8, x), y: Math.max(8, y) });
            }
            mobileWin.open();
          };
          const handleClick = w
            ? (item.name === 'Mobile' ? openMobileAboveButton : () => { if (w.isOpen) w.requestClose(); else w.open(); })
            : item.name === 'Virtual Office' ? pulseMapWindow
            : item.name === 'Drop-In Meetings' ? knockOnHoward
            : item.name === 'On-It' ? openOnItChat
            : undefined;
          return (
            <React.Fragment key={item.name}>
              {i > 0 && <div className="sc-products-dot" />}
              <ProductItem
                name={item.name}
                active={isActive}
                onClick={handleClick}
                onMouseEnter={() => setHintVisible(false)}
              />
            </React.Fragment>
          );
        })}
      </div>
      </div>

      {/* Promo section — v1 only */}
      {layout !== 'v2' && (
        <div className="sc-section sc-section-promo">
          <div className="sc-section-grid">
            <div className="sc-promo-content">
              <h2 className="sc-promo-title">THE OFFICE THAT THINKS</h2>
              <p className="sc-promo-subtitle">Roam is a Virtual Office Platform where remote work happens in the open and every action makes your company smarter.</p>
              <div className="sc-promo-buttons">
                <button className="sc-promo-btn">Book Demo</button>
                <button className="sc-promo-btn">Free Trial</button>
              </div>
            </div>
            {marqueeEl}
          </div>
        </div>
      )}

      {!embedded && (<>
      {/* Feature section — Virtual Office */}
      <div className="sc-feature-section sc-feature-section-reverse">
        <div className="sc-section-grid">
          <MapFeatureVisual theme={theme} />
          <div className="sc-feature-text sc-feature-text-right">
            <h2 className="sc-feature-title">VIRTUAL OFFICE</h2>
            <p className="sc-feature-desc">Company Visualization with Live Presence on the Map. A live view of who's in the office, who's meeting with who, who's talking, 3D chats as they happen, music people are listening to, and much more. A shared view that makes your whole company feel as if everyone's in one room. Click on anyone's head to chat with them, or click on an empty seat to enter a room with them.</p>
          </div>
        </div>
      </div>

      {/* Feature section — Drop-In Meetings */}
      <div className="sc-feature-section">
        <div className="sc-section-grid">
          <div className="sc-feature-text">
            <h2 className="sc-feature-title">DROP-IN MEETINGS</h2>
            <p className="sc-feature-desc">Knock on an empty seat in someone's private office to start an audio-only Drop-In Meeting. If they want to talk, they'll accept your knock. When you're in their office, you can also see their shelf, which shows the pictures, books, music and other things they want to showcase.</p>
            <a href="#/feature/drop-in-meetings" className="sc-feature-link">Learn about Drop-In Meetings →</a>
          </div>
          <DropInFeatureVisual theme={theme} />
        </div>
      </div>

      {/* Feature section — Meeting Room */}
      <div className="sc-feature-section sc-feature-section-reverse">
        <div className="sc-section-grid">
          <div className="sc-feature-visual sc-feature-visual-left">
            <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}>
              <MeetingWindow
                win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }}
                onDrag={() => {}}
                roomName="Daily Standup"
                people={[
                  p('Ashley B.'),
                  p('Emily C.'),
                  p('Hannah B.'),
                  p('Mia C.'),
                  p('Ethan B.'),
                  p('Sarah M.'),
                ]}
              />
            </div>
          </div>
          <div className="sc-feature-text sc-feature-text-right">
            <h2 className="sc-feature-title">VIDEO CONFERENCING</h2>
            <p className="sc-feature-desc">Jump into a Meeting Room for video conferencing when you need to collaborate. When you're done, you're done! Includes high resolution screensharing and whiteboard as well. No more back-to-back video meetings filling out all day. Just meet when you need to, and when you're done, back to work.</p>
            <a href="#/feature/video-conferencing" className="sc-feature-link">Learn about Video Conferencing →</a>
          </div>
        </div>
      </div>

      {/* Feature section — Theater */}
      <div className="sc-feature-section">
        <div className="sc-section-grid">
          <div className="sc-feature-text">
            <h2 className="sc-feature-title">THEATER</h2>
            <p className="sc-feature-desc">Take your presentations to the next level with a unique new Theater format for all-hands. Your audience sits in rows where they can whisper to each other. There's a backstage, Q&amp;A microphone, and stadium mode for 100+ people. All the world's a stage!</p>
            <a href="#/feature/theater" className="sc-feature-link">Learn about Theater →</a>
          </div>
          <div className="sc-feature-visual">
            <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}>
              <TheaterWindow
                win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }}
                onDrag={() => {}}
                speakers={theaterSpeakers}
                audience={SHOWCASE_PEOPLE}
                me={JOE}
                onOpenChat={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature section — AInbox */}
      <div className="sc-feature-section sc-feature-section-reverse">
        <div className="sc-section-grid">
          <div className="sc-feature-visual sc-feature-visual-left">
            <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}>
              <AInbox
                win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }}
                onDrag={() => {}}
                initialThreadView={{ chatId: 'engineering', messageId: 2 }}
                favoritesOverride={AINBOX_ENG_FAVORITES}
                sectionsOverride={AINBOX_ENG_SECTIONS}
                messagesOverride={AINBOX_ENG_MESSAGES}
              />
            </div>
          </div>
          <div className="sc-feature-text sc-feature-text-right">
            <h2 className="sc-feature-title">GROUP CHAT</h2>
            <p className="sc-feature-desc">Send Direct Messages, Group Chats, or Confidential Chats with AInbox. Set up your own custom groups. Tailor for your own bespoke workflow with custom folders, pinned chats, bookmarks, scheduled messages, and drag-and-drop reordering. Search your entire history. Give out guest badges to chat with people outside your organization, free!</p>
            <a href="#/feature/ainbox" className="sc-feature-link">Learn about AInbox →</a>
          </div>
        </div>
      </div>

      {/* Feature section — Magic Minutes */}
      <div className="sc-feature-section">
        <div className="sc-section-grid">
          <div className="sc-feature-text">
            <h2 className="sc-feature-title">AI-POWERED MEETING SUMMARIES</h2>
            <p className="sc-feature-desc">When you turn on Magic Minutes in a meeting, all participants will get a transcription and AI-summary of the meeting in a group chat that everyone's in. Best of all, you can prompt the minutes right in the group chat - asking questions and getting answers about certain parts of the meeting. If you're late to a meeting, you'll get an automated AI-catch-me-up. And, you can get AI summaries of any chat thread or PDF simply by prompting @MagicMinutes!</p>
            <a href="#/feature/magic-minutes" className="sc-feature-link">Learn about Magic Minutes →</a>
          </div>
          <div className="sc-feature-visual">
            <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}>
              <MagicMinutes
                win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }}
                onDrag={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature section — Lobby / Scheduling */}
      <div className="sc-feature-section sc-feature-section-reverse">
        <div className="sc-section-grid">
          <div className="sc-feature-visual sc-feature-visual-left">
            <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}>
              <Lobby win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }} onDrag={() => {}} />
            </div>
          </div>
          <div className="sc-feature-text sc-feature-text-right">
            <h2 className="sc-feature-title">SCHEDULING</h2>
            <p className="sc-feature-desc">Send your Lobby link to guests to book time with you on your calendar. Configure different links with custom time and availability settings depending on context. Tailor your Lobby to look like your company. Best of all, you can allow your guests to &ldquo;Drop-In&rdquo; which appears automatically if you&rsquo;re available.</p>
            <a href="#/feature/lobby" className="sc-feature-link">Learn about Lobby →</a>
          </div>
        </div>
      </div>

      {/* Feature section — Magicast */}
      <div className="sc-feature-section">
        <div className="sc-section-grid">
          <div className="sc-feature-text">
            <h2 className="sc-feature-title">AI SCREEN RECORDER</h2>
            <p className="sc-feature-desc">Record sales demos, investor updates, product releases, announcements or anything else you need right from your desktop with Roam Magicast. Record your screen and add your video or audio picture-in-picture to create a captivating presentation right in Roam. Easily share via AInbox or a link with someone externally. They'll get your Magicast and its transcription.</p>
            <a href="#/feature/magicast" className="sc-feature-link">Learn about Magicast →</a>
          </div>
          <MagicastFeatureVisual theme={theme} />
        </div>
      </div>

      {/* Feature section — On-It */}
      <div className="sc-feature-section sc-feature-section-reverse">
        <div className="sc-section-grid">
          <div className="sc-feature-visual sc-feature-visual-left">
            <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}>
              <OnItFeatureChat />
            </div>
          </div>
          <div className="sc-feature-text sc-feature-text-right">
            <h2 className="sc-feature-title">Your AI Assistant is On-It!</h2>
            <p className="sc-feature-desc">In legacy work, only senior people in the corner office benefited from the ultraproductivity of an assistant. In Roam, everyone gets their own AI Assistant capable of observing what's happening in the office, scheduling meetings, following up via email and chat, and searching through all of your Magic Minutes. On-It is smart enough to volunteer to grab action items after a meeting when it has the skills. Click and your AI Assistant is On-It!</p>
            <a href="#/feature/on-it" className="sc-feature-link">Learn about On-It →</a>
          </div>
        </div>
      </div>

      {/* Feature section — On-Air */}
      <div className="sc-feature-section">
        <div className="sc-section-grid">
          <div className="sc-feature-text">
            <h2 className="sc-feature-title">ON-AIR</h2>
            <p className="sc-feature-desc">Now anyone can host Immersive Events for the Creator-Era</p>
            <a href="#/feature/on-air" className="sc-feature-link">Learn about On-Air →</a>
          </div>
          <div className="sc-feature-visual">
            <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}>
              <OnAir win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }} onDrag={() => {}} demo />
            </div>
          </div>
        </div>
      </div>

      <HomepageReviews />

      {/* Footer CTA — reuses FeaturePage's fp-footer-cta styles */}
      <div className="fp-footer-cta">
        <div className="fp-footer-cta-inner">
          <div className="fp-footer-cta-lead">
            <img className="fp-footer-cta-icon" src="/icons/roam-gold-icon.png" alt="" />
            <div className="fp-footer-cta-text">
              <h2 className="fp-footer-cta-title">Ready to Grow Your Business?</h2>
              <p className="fp-footer-cta-sub text-body">Give your team an office that thinks. Book a demo or kick the tires for free.</p>
            </div>
          </div>
          <div className="fp-cta-row">
            <button className="sc-promo-btn">Book Demo</button>
            <button className="sc-promo-btn">Free Trial</button>
          </div>
        </div>
      </div>

      <Footer />
      </>)}

      {/* Theme capsule + grid toggle — pinned to right side */}
      <div className="sc-right-controls" style={HIDE_CHROME ? { display: 'none' } : undefined}>
        <div className="sc-theme-capsule" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          <div className={`sc-theme-capsule-knob ${theme === 'light' ? 'bottom' : ''}`} />
          <div className={`sc-theme-capsule-icon ${theme === 'dark' ? 'active' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 8.5C13.3 12.1 10 14.5 6.5 13.5C3 12.5 1 9.5 2 6C2.8 3.2 5.5 1.5 8.5 2C7 3.5 6.5 6 8 8.5C9 10 11 11 14 8.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div className={`sc-theme-capsule-icon ${theme === 'light' ? 'active' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" /><path d="M8 2V3.5M8 12.5V14M2 8H3.5M12.5 8H14M3.8 3.8L4.8 4.8M11.2 11.2L12.2 12.2M3.8 12.2L4.8 11.2M11.2 4.8L12.2 3.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
          </div>
        </div>
        <div className="sc-grid-capsule" onClick={() => setShowGrid(g => !g)} title="Toggle 12-column grid">
          <div className={`sc-grid-capsule-knob ${showGrid ? 'on' : ''}`} />
          <div className={`sc-grid-capsule-icon ${!showGrid ? 'active' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="11" height="11" stroke="currentColor" strokeWidth="1.3" rx="1.5" /></svg>
          </div>
          <div className={`sc-grid-capsule-icon ${showGrid ? 'active' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="11" height="11" stroke="currentColor" strokeWidth="1.3" rx="1.5" /><path d="M6 2.5V13.5M10 2.5V13.5M2.5 6H13.5M2.5 10H13.5" stroke="currentColor" strokeWidth="1" /></svg>
          </div>
        </div>
        <div className="sc-layout-capsule" onClick={() => setLayout(l => l === 'v1' ? 'v2' : 'v1')}>
          <div className={`sc-layout-capsule-knob ${layout === 'v2' ? 'bottom' : ''}`} />
          <div className={`sc-layout-capsule-label ${layout === 'v1' ? 'active' : ''}`}>v1</div>
          <div className={`sc-layout-capsule-label ${layout === 'v2' ? 'active' : ''}`}>v2</div>
        </div>
      </div>

    </div>
  );
}
