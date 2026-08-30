export type Puzzle = {
  id: number;
  level: number;
  title: string;
  scenario: string;
  question: string;
  codeSnippet?: string;
  answer: string[];
  reward: string;
};

export const puzzles: Puzzle[] = [
  // --- LEVEL 1: Laboratory ---
  {
    id: 1,
    level: 1,
    title: "The Syntax Cipher",
    scenario: "The computer is locked. You find a corrupted Python script on the screen.",
    question: "What single character is missing to make this code compile?",
    codeSnippet: "def greet(name)\n    return 'Hello ' + name",
    answer: [":", ": "],
    reward: "Gold Key"
  },
  {
    id: 2,
    level: 1,
    title: "The Infinite Loop Trap",
    scenario: "The drawer is secured by an electronic lock running an infinite loop.",
    question: "The lock won't open because the system is crashing. What line of code must be added to fix this loop?",
    codeSnippet: "let x = 10;\nwhile(x > 0) {\n  console.log('Unlocking...');\n  // ADD CODE HERE \n}",
    answer: ["x--;", "x--", "x -= 1;", "x-=1;", "x -= 1", "x-=1", "x = x - 1;", "x=x-1;", "x = x - 1", "x=x-1", "break;", "break"],
    reward: "Master Key"
  },
  {
    id: 3,
    level: 1,
    title: "Level 1 Exit",
    scenario: "The main exit door terminal was hacked! The logs show the breach query.",
    question: "You are given the query used in the login form. What type of attack was used here?",
    codeSnippet: "SELECT * FROM users \nWHERE username = 'admin' \nAND password = '' OR '1'='1'",
    answer: ["SQL Injection", "SQLi", "SQL injection attack", "sql injection"],
    reward: "Escape"
  },

  // --- LEVEL 2: Server Room ---
  {
    id: 4,
    level: 2,
    title: "The Missing Dependency",
    scenario: "A server rack is showing a critical React rendering error.",
    question: "This hook is meant to run only once on mount, but it runs on every render. What is missing?",
    codeSnippet: "useEffect(() => {\n  initServerConnection();\n});",
    answer: ["[]", "[] ", "[]\n", "empty array", "an empty array", "dependency array", "a dependency array"],
    reward: "Server Key"
  },
  {
    id: 5,
    level: 2,
    title: "Regex Router",
    scenario: "The network router requires a specific regex pattern to allow SSH traffic.",
    question: "What regex character matches the start of a string?",
    codeSnippet: "const pattern = /__ssh-traffic/;",
    answer: ["^", "^ "],
    reward: "Admin Card"
  },
  {
    id: 6,
    level: 2,
    title: "Level 2 Exit",
    scenario: "The blast door is secured with a hashing challenge.",
    question: "Which cryptographic hash function is famously considered broken and insecure for passwords, producing a 128-bit hash value?",
    codeSnippet: "",
    answer: ["MD5", "md5", "MD-5"],
    reward: "Escape"
  },

  // --- LEVEL 3: Reactor Core ---
  {
    id: 7,
    level: 3,
    title: "Memory Leak Menace",
    scenario: "The core coolant system is running out of memory.",
    question: "Which cleanup expression should you return from this hook when the component unmounts?",
    codeSnippet: "useEffect(() => {\n  window.addEventListener('resize', handleResize);\n  // WHAT GOES HERE?\n}, []);",
    answer: ["return () => window.removeEventListener('resize', handleResize);", "return () => window.removeEventListener('resize', handleResize)", "() => window.removeEventListener('resize', handleResize)"],
    reward: "Coolant Override"
  },
  {
    id: 8,
    level: 3,
    title: "The Final Breach",
    scenario: "The reactor lockdown mechanism is controlled by a faulty API endpoint.",
    question: "What HTTP method should ideally be used to completely replace an existing resource?",
    codeSnippet: "fetch('/api/reactor/status', {\n  method: '__',\n  body: JSON.stringify({ locked: false })\n})",
    answer: ["PUT", "put"],
    reward: "Escape"
  },

  // --- LEVEL 4: Debug Wing ---
  {
    id: 9,
    level: 4,
    title: "Heap Glitch Matrix",
    scenario: "A suspended memory register is throwing unhandled pointer exceptions.",
    question: "In C/C++, which function is used to deallocate memory allocated with 'malloc'?",
    codeSnippet: "char *buffer = (char*)malloc(1024);\n// ... process anomalous packets ...\n// WHAT FUNCTION RELEASES THIS BUFFER?",
    answer: ["free", "free()", "free(buffer)", "free(buffer);"],
    reward: "Memory Bypass Key"
  },
  {
    id: 10,
    level: 4,
    title: "The Bitwise Obfuscator",
    scenario: "The sub-routine decrypts security registers using binary bit shifts.",
    question: "What is the numerical result of the evaluated expression (1 << 3) in decimal?",
    codeSnippet: "const authMask = 1 << 3;\nconsole.log(authMask); // Output?",
    answer: ["8", "8 "],
    reward: "Cipher Chip"
  },
  {
    id: 11,
    level: 4,
    title: "The Race Condition",
    scenario: "Two asynchronous threads are mutating the same memory address simultaneously without a mutex lock.",
    question: "What concurrency flaw occurs when multiple threads attempt to read and write shared state without synchronization?",
    codeSnippet: "let counter = 0;\nasync function worker() { counter++; }\nPromise.all([worker(), worker()]);",
    answer: ["Race Condition", "Race condition", "race condition", "data race", "Data race", "Data Race"],
    reward: "Escape"
  },

  // --- LEVEL 5: The Nexus ---
  {
    id: 12,
    level: 5,
    title: "Topological Singularity",
    scenario: "The nexus core graphs all node dependencies to resolve the spacetime cycle.",
    question: "Which graph traversal algorithm uses a First-In-First-Out (FIFO) queue data structure?",
    codeSnippet: "const queue = [rootNode];\nwhile(queue.length > 0) {\n  const current = queue.shift();\n  // ... explore neighbors\n}",
    answer: ["Breadth First Search", "BFS", "breadth-first search", "breadth first search", "Breadth-First Search"],
    reward: "Singularity Prism"
  },
  {
    id: 13,
    level: 5,
    title: "Quantum State Memoization",
    scenario: "The temporal loop is recalculating identical Fibonacci subproblems exponentially.",
    question: "What optimization technique stores the results of expensive function calls to return cached results for identical inputs?",
    codeSnippet: "const cache = {};\nfunction compute(n) {\n  if (n in cache) return cache[n];\n  // ... compute & save to cache\n}",
    answer: ["Memoization", "memoization", "caching", "Memoize", "memoize"],
    reward: "Omni Core"
  },
  {
    id: 14,
    level: 5,
    title: "Genesis Genesis Protocol",
    scenario: "The central intelligence demands a cryptographic proof that you know the secret key without revealing the key itself.",
    question: "What class of cryptographic method enables one party to prove to another that a statement is true without revealing any secret information?",
    codeSnippet: "ZK-SNARK Protocol // Verification Stage\n// PROVE SECRET WITHOUT REVEALING KEY",
    answer: ["Zero-Knowledge Proof", "Zero Knowledge Proof", "ZKP", "zk-SNARK", "zero knowledge", "zero-knowledge proof", "Zero-Knowledge", "zero knowledge proof"],
    reward: "Escape"
  }
];
