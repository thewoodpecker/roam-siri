const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const offices = [
  // Row 1
  {
    id: 1,
    name: 'Leslie A.',
    icon: 'lock',
    size: 'small',
    people: [{ name: 'Leslie A.', avatar: 'https://i.pravatar.cc/150?img=5' }],
  },
  {
    id: 2,
    name: 'Devon L.',
    icon: 'verified',
    size: 'small',
    people: [{ name: 'Devon Lane', avatar: 'https://i.pravatar.cc/150?img=11' }],
  },
  {
    id: 3,
    name: 'David M.',
    size: 'small',
    people: [
      { name: 'David', avatar: 'https://i.pravatar.cc/150?img=32' },
      { name: 'Bruce', avatar: 'https://i.pravatar.cc/150?img=53' },
    ],
  },
  {
    id: 4,
    name: 'Darrell S.',
    size: 'small',
    people: [{ name: 'Darrell Steward', avatar: 'https://i.pravatar.cc/150?img=60' }],
  },
  {
    id: 5,
    name: 'Jerome B.',
    size: 'small',
    people: [{ name: 'Jerome Bell', avatar: 'https://i.pravatar.cc/150?img=68' }],
  },
  // Row 2-4 left
  {
    id: 6,
    name: 'Jane C.',
    size: 'small',
    people: [{ name: 'Jane Cooper', avatar: 'https://i.pravatar.cc/150?img=47' }],
  },
  {
    id: 7,
    name: 'Wade W.',
    size: 'small',
    people: [{ name: 'Wade Warren', avatar: 'https://i.pravatar.cc/150?img=12' }],
  },
  {
    id: 8,
    name: 'Dianne R.',
    size: 'small',
    people: [
      { name: 'Dianne Russell', avatar: 'https://i.pravatar.cc/150?img=26' },
      { name: 'Guest', avatar: 'https://i.pravatar.cc/150?img=9' },
    ],
  },
  {
    id: 9,
    name: 'Joe W.',
    size: 'small',
    people: [{ name: 'Joe Woodward', avatar: 'https://i.pravatar.cc/150?img=33' }],
  },
  {
    id: 10,
    name: 'Robert F.',
    size: 'small',
    people: [{ name: 'Robert Fox', avatar: 'https://i.pravatar.cc/150?img=20' }],
  },
  {
    id: 11,
    name: 'Jeff G.',
    size: 'small',
    people: [
      { name: 'Harold', avatar: 'https://i.pravatar.cc/150?img=51' },
      { name: 'Jorge', avatar: 'https://i.pravatar.cc/150?img=54' },
    ],
  },
  {
    id: 12,
    name: 'Cody F.',
    size: 'small',
    people: [{ name: 'Cody Fisher', avatar: 'https://i.pravatar.cc/150?img=14' }],
  },
  {
    id: 13,
    name: 'Guy H.',
    size: 'small',
    people: [{ name: 'Guy Hawkins', avatar: 'https://i.pravatar.cc/150?img=44' }],
  },
  // Theater - wide card
  {
    id: 14,
    name: 'Theater',
    type: 'theater',
    size: 'wide',
    icon: 'screen',
    people: [
      { name: 'Presenter 1', avatar: 'https://i.pravatar.cc/150?img=25' },
      { name: 'Presenter 2', avatar: 'https://i.pravatar.cc/150?img=57' },
    ],
  },
  // Right column
  {
    id: 15,
    name: 'Floyd M.',
    size: 'small',
    people: [{ name: 'Floyd Miles', avatar: 'https://i.pravatar.cc/150?img=15' }],
  },
  {
    id: 16,
    name: 'Walt D.',
    size: 'small',
    people: [
      { name: 'Walt', avatar: 'https://i.pravatar.cc/150?img=59' },
      { name: 'Guest', avatar: 'https://i.pravatar.cc/150?img=19' },
    ],
  },
  // Alan Kay - wide card
  {
    id: 17,
    name: 'Alan Kay',
    type: 'meeting',
    size: 'wide',
    icon: 'screenshare',
    people: [
      { name: 'Tommy', avatar: 'https://i.pravatar.cc/150?img=61', gradient: true },
      { name: 'Rubio', avatar: 'https://i.pravatar.cc/150?img=58', gradient: true },
      { name: 'Dave', avatar: 'https://i.pravatar.cc/150?img=52', gradient: true },
      { name: 'Jean', avatar: 'https://i.pravatar.cc/150?img=24', gradient: true },
      { name: 'Stacey', avatar: 'https://i.pravatar.cc/150?img=23', gradient: true },
    ],
  },
];

app.get('/api/offices', (req, res) => {
  res.json(offices);
});

// Serve static files in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
