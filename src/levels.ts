export type LevelShape = 'circle' | 'hexagon' | 'diamond' | 'triangle' | 'square';

export interface LevelData {
  id: number;
  name: string;
  depth: string;
  fragments: number;
  concepts: string[];
  shape: LevelShape;
  still: string;
}

export const levels: LevelData[] = [
  {
    id: 1,
    name: 'The Laboratory',
    depth: '40m',
    fragments: 3,
    concepts: ['SYNTAX', 'LOGIC'],
    shape: 'circle',
    still: '/stills/level-1.png'
  },
  {
    id: 2,
    name: 'The Undo Bay',
    depth: '95m',
    fragments: 3,
    concepts: ['STACKS', 'QUEUES'],
    shape: 'hexagon',
    still: '/stills/level-2.png'
  },
  {
    id: 3,
    name: 'The Mirror Room',
    depth: '165m',
    fragments: 2,
    concepts: ['RECURSION', 'TREES'],
    shape: 'diamond',
    still: '/stills/level-3.png'
  },
  {
    id: 4,
    name: 'The Cable Maze',
    depth: '240m',
    fragments: 3,
    concepts: ['GRAPHS', 'TRAVERSAL'],
    shape: 'triangle',
    still: '/stills/level-4.png'
  },
  {
    id: 5,
    name: 'The Core',
    depth: '310m',
    fragments: 1,
    concepts: ['DP', 'GREEDY'],
    shape: 'square',
    still: '/stills/level-5.png'
  }
];
