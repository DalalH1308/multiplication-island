/* ===== data.js : tables, island places, messages, tricks ===== */
'use strict';

const TABLES = [4, 6, 7, 8, 9];

const LOCATIONS = [
  { id: 'forest', name: 'Magic Forest', table: 4, color: '#23a566', soft: '#e3f8ec',
    goal: 'Grow 8 magic trees.', piece: 'A new tree grew!', reward: 'You grew a magic forest!' },
  { id: 'bridge', name: 'Rainbow Bridge', table: 6, color: '#7b6cf6', soft: '#ece9ff',
    goal: 'Build the bridge, one plank at a time.', piece: 'You added a plank!', reward: 'You built a new bridge!' },
  { id: 'garden', name: 'Secret Garden', table: 7, color: '#e8487e', soft: '#ffe6ee',
    goal: 'Help 8 flowers bloom.', piece: 'A flower bloomed!', reward: 'You opened the Secret Garden!' },
  { id: 'lighthouse', name: 'Lighthouse Island', table: 8, color: '#f0702a', soft: '#fff0e3',
    goal: 'Build the lighthouse up to the light.', piece: 'The lighthouse is taller!', reward: 'You lit the lighthouse!' },
  { id: 'castle', name: 'Champion Castle', table: 9, color: '#3d7be0', soft: '#e6f0ff',
    goal: 'Build the castle, block by block.', piece: 'You added a block!', reward: 'You are a Multiplication Champion!' }
];
const locForTable = T => LOCATIONS.find(l => l.table === T);

const MSG = {
  correct: ['Great job!', 'You got it!', 'Well done!'],
  tryAgain: "Good try! Let's think together.",
  another: 'Try another way.',
  needHint: 'Need a hint?',
  together: "Let's work it out together.",
  learned: 'Mistakes help us learn!',
  helped: 'Helpers are good for learning. Next time, try it on your own!'
};

/* The trick for each table. "7 × 6" means 7 groups of 6. */
const TRICKS = {
  4: { title: 'The 4s trick: double, then double again',
       text: '4 groups = 2 groups + 2 groups. Find 2 groups. Then double it.',
       fun: 'Fun fact: all the answers in the 4s are even numbers: 4, 8, 12, 16, 20…' },
  6: { title: 'The 6s trick: 5 groups and 1 more',
       text: '6 groups = 5 groups + 1 group. Find 5 groups. Then add one more group.',
       fun: 'Fun fact: 6 × an even number ends with that number. 6 × 4 = 24. 6 × 8 = 48.' },
  7: { title: 'The 7s trick: 5 groups and 2 groups',
       text: '7 groups = 5 groups + 2 groups. Find both parts. Then put them together.',
       fun: 'Fun fact: 5, 6, 7, 8 → 56 = 7 × 8!' },
  8: { title: 'The 8s trick: double, double, double',
       text: '8 groups = 4 groups + 4 groups. Find 4 groups. Then double it.',
       fun: 'Fun fact: the last digits go 8, 6, 4, 2, 0, and then again: 8, 16, 24, 32, 40, 48…' },
  9: { title: 'The 9s trick: 10 groups, take away 1',
       text: '9 groups = 10 groups − 1 group. Find 10 groups. Then take away one group.',
       fun: 'Fun fact: in the 9s, the digits add up to 9. 18 → 1 + 8 = 9. 72 → 7 + 2 = 9.' }
};
