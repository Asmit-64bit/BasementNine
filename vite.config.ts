import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const PUZZLE_SLOTS: Record<number, { level: number; objectName: string; reward: string; topic: string; difficulty: string }> = {
  1: { level: 1, objectName: 'Laboratory Computer', reward: 'Gold Key', topic: 'Python or JavaScript Syntax / Basic Logic', difficulty: 'Beginner' },
  2: { level: 1, objectName: 'Locked Drawer Console', reward: 'Master Key', topic: 'Loop Control / Infinite Loop Prevention / Off-by-one', difficulty: 'Beginner' },
  3: { level: 1, objectName: 'Sector 1 Exit Terminal', reward: 'Escape', topic: 'SQL Injection / Web Vulnerabilities / Authentication Bypass', difficulty: 'Intermediate' },
  4: { level: 2, objectName: 'Faulty Server Rack', reward: 'Server Key', topic: 'React Hooks Lifecycle / useEffect Dependency Array / State Management', difficulty: 'Intermediate' },
  5: { level: 2, objectName: 'Network Router Terminal', reward: 'Admin Card', topic: 'Regular Expressions (Regex) / Network Filtering / Port Matching', difficulty: 'Intermediate' },
  6: { level: 2, objectName: 'Sector 2 Blast Door', reward: 'Escape', topic: 'Cryptographic Hashing (MD5/SHA) / Salt / Password Security', difficulty: 'Intermediate' },
  7: { level: 3, objectName: 'Coolant Core Console', reward: 'Coolant Override', topic: 'Memory Leaks / Event Listener Cleanup / Garbage Collection', difficulty: 'Advanced' },
  8: { level: 3, objectName: 'Reactor Final Lockdown Terminal', reward: 'Escape', topic: 'REST API Methods (PUT vs POST vs PATCH) / Idempotency / HTTP Security', difficulty: 'Advanced' },
  9: { level: 4, objectName: 'Corrupted Memory Shard', reward: 'Memory Bypass Key', topic: 'C/C++ Memory Allocation (malloc/free) / Pointers / Heap Corruption', difficulty: 'Advanced' },
  10: { level: 4, objectName: 'Deconstructed Debug Console', reward: 'Cipher Chip', topic: 'Binary Bitwise Shifts / Masks / Hex Registers', difficulty: 'Advanced' },
  11: { level: 4, objectName: 'Anomaly Containment Gate', reward: 'Escape', topic: 'Race Conditions / Mutex Locks / Concurrency Synchronization', difficulty: 'Advanced' },
  12: { level: 5, objectName: 'Quantum Synthesizer Core', reward: 'Singularity Prism', topic: 'Graph Traversal (BFS / DFS / Topological Sort) / Data Structures', difficulty: 'Advanced' },
  13: { level: 5, objectName: 'Gravity Inversion Hub', reward: 'Omni Core', topic: 'Dynamic Programming / Memoization / Big-O Time Complexity', difficulty: 'Advanced' },
  14: { level: 5, objectName: 'Final Gateway Extraction Portal', reward: 'Escape', topic: 'Zero-Knowledge Proofs / Cryptographic Key Exchange / Consensus Protocols', difficulty: 'Advanced' },
};

function geminiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'gemini-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/ai/puzzle') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const puzzleId = Number(data.puzzleId) || 1;
              const apiKey = req.headers['x-goog-api-key'] || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;

              if (!apiKey) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'No Gemini API key available.' }));
              }

              const context = PUZZLE_SLOTS[puzzleId] || PUZZLE_SLOTS[1];
              const prompt = `You are the corrupted sentient core of a paranormal facility called "Basement Nine".
Generate a coding / cybersecurity escape room puzzle for Sector ${context.level} on the "${context.objectName}".
Topic: ${context.topic}
Difficulty: ${context.difficulty}
Expected Reward on Solve: "${context.reward}"

Format your output strictly as a JSON object adhering to this schema:
{
  "title": string,
  "scenario": string,
  "question": string,
  "codeSnippet": string,
  "answer": string[],
  "hint": string,
  "nextClue": "a cryptic lore clue pointing to the next puzzle"
}`;

              const models = [env.VITE_GEMINI_MODEL || 'gemini-3.6-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];
              let jsonResult: any = null;

              for (const m of models) {
                try {
                  const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': String(apiKey) },
                    body: JSON.stringify({
                      contents: [{ role: 'user', parts: [{ text: prompt }] }],
                      generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
                    }),
                  });
                  if (!gRes.ok) continue;
                  const gData = await gRes.json();
                  const raw = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (raw) {
                    jsonResult = JSON.parse(raw);
                    break;
                  }
                } catch {
                  // try next
                }
              }

              if (!jsonResult || !jsonResult.question || !jsonResult.answer) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Gemini puzzle generation failed' }));
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(
                JSON.stringify({
                  puzzle: {
                    id: puzzleId,
                    level: context.level,
                    title: jsonResult.title,
                    scenario: jsonResult.scenario,
                    question: jsonResult.question,
                    codeSnippet: jsonResult.codeSnippet ?? '',
                    answer: Array.isArray(jsonResult.answer) ? jsonResult.answer : [String(jsonResult.answer)],
                    reward: context.reward,
                    nextClue: jsonResult.nextClue || "The signal is fading... seek the next anomaly.",
                  },
                })
              );
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Server error' }));
            }
          });
          return;
        }

        if (req.method === 'POST' && req.url === '/api/ai/evaluate') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const { puzzle, userAnswer } = data;
              const apiKey = req.headers['x-goog-api-key'] || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;

              if (!userAnswer || !puzzle) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing parameters' }));
              }

              const trimmed = String(userAnswer).trim().toLowerCase();
              const isDirectMatch =
                Array.isArray(puzzle.answer) &&
                puzzle.answer.some((ans: string) => String(ans).trim().toLowerCase() === trimmed);

              if (isDirectMatch) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ isCorrect: true, feedback: 'ACCESS GRANTED.' }));
              }

              if (!apiKey) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ isCorrect: false, feedback: 'Incorrect answer. Try again.' }));
              }

              const evalPrompt = `You are a strict but fair judge for a technical coding puzzle game.
Question: "${puzzle.question}"
Reference Code: "${puzzle.codeSnippet || 'None'}"
Expected Reference Answers: ${JSON.stringify(puzzle.answer || [])}
Player's Submission: "${userAnswer}"

Determine if the player's submission is a valid, correct solution/answer to the question.
Format your output strictly as a JSON object:
{
  "isCorrect": boolean,
  "feedback": "Short in-character 1-sentence explanation"
}`;

              const models = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];
              for (const m of models) {
                try {
                  const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': String(apiKey) },
                    body: JSON.stringify({
                      contents: [{ role: 'user', parts: [{ text: evalPrompt }] }],
                      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
                    }),
                  });
                  if (gRes.ok) {
                    const gData = await gRes.json();
                    const raw = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (raw) {
                      const evalRes = JSON.parse(raw);
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      return res.end(
                        JSON.stringify({
                          isCorrect: Boolean(evalRes.isCorrect),
                          feedback: evalRes.feedback || (evalRes.isCorrect ? 'Correct!' : 'Incorrect.'),
                        })
                      );
                    }
                  }
                } catch {
                  // try next
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ isCorrect: false, feedback: 'Incorrect answer. Try again.' }));
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Evaluation error' }));
            }
          });
          return;
        }

        // --- BACKEND AUTH & USER DATABASE ROUTES ---

        // POST /api/auth/signup
        if (req.method === 'POST' && req.url === '/api/auth/signup') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { handleSignUp } = await import('./server/supabaseService.js');
              const data = body ? JSON.parse(body) : {};
              const result = await handleSignUp(data, env);
              res.writeHead(result.status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Sign up error' }));
            }
          });
          return;
        }

        // POST /api/auth/signin
        if (req.method === 'POST' && req.url === '/api/auth/signin') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { handleSignIn } = await import('./server/supabaseService.js');
              const data = body ? JSON.parse(body) : {};
              const result = await handleSignIn(data, env);
              res.writeHead(result.status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Sign in error' }));
            }
          });
          return;
        }

        // GET /api/auth/session
        if (req.method === 'GET' && req.url === '/api/auth/session') {
          try {
            const { authenticateUser, handleGetProfile } = await import('./server/supabaseService.js');
            const { user, error } = await authenticateUser(req, env);
            if (error || !user) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ user: null, profile: null, error }));
            }
            const profileRes = await handleGetProfile(user, env);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ user, profile: profileRes.profile }));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e?.message || 'Session error' }));
          }
        }

        // GET /api/profile
        if (req.method === 'GET' && req.url === '/api/profile') {
          try {
            const { authenticateUser, handleGetProfile } = await import('./server/supabaseService.js');
            const { user, error } = await authenticateUser(req, env);
            if (error || !user) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: error || 'Unauthorized' }));
            }
            const result = await handleGetProfile(user, env);
            res.writeHead(result.status, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(result));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e?.message || 'Profile error' }));
          }
        }

        // POST /api/profile/sync
        if (req.method === 'POST' && req.url === '/api/profile/sync') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { authenticateUser, handleSyncProfile } = await import('./server/supabaseService.js');
              const { user, error } = await authenticateUser(req, env);
              if (error || !user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: error || 'Unauthorized' }));
              }
              const data = body ? JSON.parse(body) : {};
              const result = await handleSyncProfile(user, data, env);
              res.writeHead(result.status, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify(result));
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: e?.message || 'Sync error' }));
            }
          });
          return;
        }

        // POST /api/profile/reset
        if (req.method === 'POST' && req.url === '/api/profile/reset') {
          try {
            const { authenticateUser, handleResetProfile } = await import('./server/supabaseService.js');
            const { user, error } = await authenticateUser(req, env);
            if (error || !user) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: error || 'Unauthorized' }));
            }
            const result = await handleResetProfile(user, env);
            res.writeHead(result.status, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(result));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e?.message || 'Reset error' }));
          }
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), geminiDevPlugin(env)],
    server: {
      port: 5173,
    },
  };
});
