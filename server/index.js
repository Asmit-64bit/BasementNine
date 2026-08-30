import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually if present
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

const PUZZLE_SLOTS = {
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

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-goog-api-key, Authorization',
  });
  res.end(JSON.stringify(data));
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-goog-api-key, Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // 1. Health Check
  if (url.pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'ok',
      service: "Schrodinger's Abyss Backend API",
      aiConfigured: Boolean(GEMINI_API_KEY),
    });
  }

  // 2. Generate Puzzle Endpoint
  if (url.pathname === '/api/ai/puzzle' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const puzzleId = Number(body.puzzleId) || 1;
      const clientKey = req.headers['x-goog-api-key'] || body.customApiKey;
      const apiKey = clientKey || GEMINI_API_KEY;

      if (!apiKey) {
        return sendJson(res, 400, {
          error: 'No Gemini API key available on backend or client request header.',
        });
      }

      const context = PUZZLE_SLOTS[puzzleId] || PUZZLE_SLOTS[1];

      const prompt = `
You are the corrupted sentient core of a paranormal facility called "Schrodinger's Abyss".
Generate a coding / cybersecurity escape room puzzle for Sector ${context.level} on the "${context.objectName}".

Topic: ${context.topic}
Difficulty: ${context.difficulty}
Expected Reward on Solve: "${context.reward}"

Requirements:
1. "title": Atmospheric eerie title (e.g. "The Void Pointer // Buffer 04", "Spectral Packet Sniffer")
2. "scenario": 1-2 sentence atmospheric horror lore description about this specific terminal/device.
3. "question": Clear, concise question asking the player to identify a missing token, fix a bug, specify an attack name, or provide a regex/code fix.
4. "codeSnippet": A short, clean code snippet (in Python, JavaScript/TypeScript, SQL, or JSON) containing the bug or puzzle (or empty string if purely conceptual).
5. "answer": Array of 2-8 acceptable string variations of the correct answer (case-insensitive, including shorthand, punctuation variations).
6. "hint": A subtle, in-character cryptic clue.

Format your output strictly as a JSON object adhering to this schema:
{
  "title": string,
  "scenario": string,
  "question": string,
  "codeSnippet": string,
  "answer": string[],
  "hint": string
}
`;

      const modelsToTry = [
        process.env.VITE_GEMINI_MODEL || 'gemini-3.6-flash',
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-2.5-flash',
      ];
      let jsonResult = null;

      for (const m of modelsToTry) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
              },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.8,
                },
              }),
            }
          );

          if (!geminiRes.ok) continue;

          const data = await geminiRes.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            jsonResult = JSON.parse(rawText);
            break;
          }
        } catch {
          // try next model
        }
      }

      if (!jsonResult || !jsonResult.question || !jsonResult.answer) {
        return sendJson(res, 502, { error: 'Gemini did not return a valid puzzle structure' });
      }

      return sendJson(res, 200, {
        puzzle: {
          id: puzzleId,
          level: context.level,
          title: jsonResult.title,
          scenario: jsonResult.scenario,
          question: jsonResult.question,
          codeSnippet: jsonResult.codeSnippet ?? '',
          answer: Array.isArray(jsonResult.answer) ? jsonResult.answer : [String(jsonResult.answer)],
          reward: context.reward,
        },
      });
    } catch {
      return sendJson(res, 500, { error: 'Internal server error generating puzzle' });
    }
  }

  // 3. Evaluate Answer Endpoint
  if (url.pathname === '/api/ai/evaluate' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { puzzle, userAnswer } = body;
      const clientKey = req.headers['x-goog-api-key'] || body.customApiKey;
      const apiKey = clientKey || GEMINI_API_KEY;

      if (!userAnswer || !puzzle) {
        return sendJson(res, 400, { error: 'Missing puzzle or userAnswer' });
      }

      const trimmed = String(userAnswer).trim().toLowerCase();

      // Check direct local match first
      const isDirectMatch = Array.isArray(puzzle.answer) && puzzle.answer.some(
        (ans) => String(ans).trim().toLowerCase() === trimmed
      );

      if (isDirectMatch) {
        return sendJson(res, 200, { isCorrect: true, feedback: 'ACCESS GRANTED.' });
      }

      if (!apiKey) {
        return sendJson(res, 200, { isCorrect: false, feedback: 'Incorrect answer. Try again.' });
      }

      const evalPrompt = `
You are a strict but fair judge for a technical coding puzzle game.
Question: "${puzzle.question}"
Reference Code: "${puzzle.codeSnippet || 'None'}"
Expected Reference Answers: ${JSON.stringify(puzzle.answer || [])}
Player's Submission: "${userAnswer}"

Determine if the player's submission is a valid, correct solution/answer to the question.
Format your output strictly as a JSON object:
{
  "isCorrect": boolean,
  "feedback": "Short in-character 1-sentence explanation"
}
`;

      const evalModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];
      for (const em of evalModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${em}:generateContent`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
              },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: evalPrompt }] }],
                generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const evalResult = JSON.parse(rawText);
              return sendJson(res, 200, {
                isCorrect: Boolean(evalResult.isCorrect),
                feedback: evalResult.feedback || (evalResult.isCorrect ? 'Correct!' : 'Incorrect.'),
              });
            }
          }
        } catch {
          // try next model
        }
      }

      return sendJson(res, 200, { isCorrect: false, feedback: 'Incorrect answer. Try again.' });
    } catch {
      return sendJson(res, 500, { error: 'Internal evaluation error' });
    }
  }

  return sendJson(res, 404, { error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`[ABYSS BACKEND] Secure API server listening on http://localhost:${PORT}`);
  console.log(`[ABYSS BACKEND] Gemini AI Status: ${GEMINI_API_KEY ? 'ACTIVE (Server Key Configured)' : 'STANDBY (Client/Curated Mode)'}`);
});
