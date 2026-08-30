import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

let supabaseClient = null;

export function getSupabaseAdmin(env) {
  if (supabaseClient) return supabaseClient;

  const url = env.VITE_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = env.VITE_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  const keyToUse = serviceKey || anonKey;

  if (!url || !keyToUse || !url.startsWith('https://')) {
    return null;
  }

  supabaseClient = createClient(url, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseClient;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

/**
 * Validate Bearer JWT token from request header
 */
export async function authenticateUser(req, env) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No authorization token provided' };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { user: null, error: 'Supabase is not configured on server' };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { user: null, error: error?.message || 'Invalid or expired token' };
    }
    return { user, token, error: null };
  } catch (err) {
    return { user: null, error: err?.message || 'Token verification failed' };
  }
}

/**
 * Register a new user and create their profile row with email and password
 */
export async function handleSignUp({ email, password, operatorName }, env) {
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured on server', status: 503 };
  }

  if (!email || !password) {
    return { error: 'Email and password are required', status: 400 };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanOperatorName = (operatorName || 'OPERATOR_09').trim().toUpperCase();
  const pwdHash = hashPassword(password);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          operator_name: cleanOperatorName,
        },
      },
    });

    if (error) {
      return { error: error.message, status: 400 };
    }

    const user = data.user;
    const session = data.session;

    let profile = null;
    if (user) {
      // Upsert profile row with email & password hash
      const profileRow = {
        id: user.id,
        email: cleanEmail,
        password_hash: pwdHash,
        operator_name: cleanOperatorName,
        unlocked_level: 1,
        completed_levels: [],
        best_times: {},
        achievements: [],
        sanity: 100,
        min_sanity_recorded: 100,
        updated_at: new Date().toISOString(),
      };

      const { data: profileData, error: upsertErr } = await supabase
        .from('profiles')
        .upsert(profileRow)
        .select()
        .maybeSingle();

      if (upsertErr) {
        // If email or password_hash columns do not exist yet in table, fall back to base columns
        console.warn('Notice: profiles table schema might need migration:', upsertErr.message);
        const { data: fallbackData } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            operator_name: cleanOperatorName,
            unlocked_level: 1,
            completed_levels: [],
            best_times: {},
            achievements: [],
            sanity: 100,
            min_sanity_recorded: 100,
            updated_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();
        profile = fallbackData;
      } else {
        profile = profileData;
      }
    }

    return {
      user,
      session,
      profile,
      message: session ? undefined : 'Registration successful! Verification email sent.',
      status: 200,
    };
  } catch (err) {
    return { error: err?.message || 'Failed to register operator', status: 500 };
  }
}

/**
 * Sign in existing user, update email / password in profile, and fetch profile
 */
export async function handleSignIn({ email, password }, env) {
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured on server', status: 503 };
  }

  if (!email || !password) {
    return { error: 'Email and password are required', status: 400 };
  }

  const cleanEmail = email.trim().toLowerCase();
  const pwdHash = hashPassword(password);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { error: error.message, status: 401 };
    }

    const user = data.user;
    const session = data.session;

    // Fetch or update user profile with latest email and password hash
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      try {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({ email: cleanEmail, password_hash: pwdHash, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .maybeSingle();
        if (updatedProfile) {
          profile = updatedProfile;
        }
      } catch (updateErr) {
        console.warn('Profile credential sync notice:', updateErr);
      }
    }

    return {
      user,
      session,
      profile: profile || null,
      status: 200,
    };
  } catch (err) {
    return { error: err?.message || 'Authentication failed', status: 500 };
  }
}

/**
 * Fetch profile for authenticated user
 */
export async function handleGetProfile(user, env) {
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured', status: 503 };
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      return { error: error.message, status: 400 };
    }

    return { profile: profile || null, status: 200 };
  } catch (err) {
    return { error: err?.message || 'Error fetching profile', status: 500 };
  }
}

/**
 * Sync / Upsert progress data for authenticated user (preserves email and credentials)
 */
export async function handleSyncProfile(user, payload, env) {
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured', status: 503 };
  }

  try {
    const sanityVal = typeof payload.sanity === 'number'
      ? Math.max(0, Math.min(100, Math.round(payload.sanity)))
      : 100;

    const minSanityVal = typeof payload.min_sanity_recorded === 'number'
      ? Math.max(0, Math.min(100, Math.round(payload.min_sanity_recorded)))
      : sanityVal;

    const profilePayload = {
      id: user.id,
      email: user.email || payload.email || undefined,
      operator_name: (payload.operator_name || 'OPERATOR_09').trim().toUpperCase(),
      unlocked_level: typeof payload.unlocked_level === 'number' ? Math.max(1, Math.min(5, payload.unlocked_level)) : 1,
      completed_levels: Array.isArray(payload.completed_levels) ? payload.completed_levels : [],
      best_times: typeof payload.best_times === 'object' && payload.best_times !== null ? payload.best_times : {},
      achievements: Array.isArray(payload.achievements) ? payload.achievements : [],
      sanity: sanityVal,
      min_sanity_recorded: minSanityVal,
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(profilePayload)
      .select()
      .maybeSingle();

    if (error) {
      // Fallback if email column not in table yet
      const fallbackPayload = { ...profilePayload };
      delete fallbackPayload.email;
      const { data: fbData, error: fbErr } = await supabase
        .from('profiles')
        .upsert(fallbackPayload)
        .select()
        .maybeSingle();

      if (fbErr) {
        return { error: fbErr.message, status: 400 };
      }
      return { profile: fbData, success: true, status: 200 };
    }

    return { profile, success: true, status: 200 };
  } catch (err) {
    return { error: err?.message || 'Error syncing profile', status: 500 };
  }
}

/**
 * Reset profile data for authenticated user
 */
export async function handleResetProfile(user, env) {
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured', status: 503 };
  }

  try {
    const resetPayload = {
      id: user.id,
      email: user.email || undefined,
      unlocked_level: 1,
      completed_levels: [],
      best_times: {},
      achievements: [],
      sanity: 100,
      min_sanity_recorded: 100,
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(resetPayload)
      .select()
      .maybeSingle();

    if (error) {
      delete resetPayload.email;
      const { data: fbData, error: fbErr } = await supabase
        .from('profiles')
        .upsert(resetPayload)
        .select()
        .maybeSingle();

      if (fbErr) return { error: fbErr.message, status: 400 };
      return { profile: fbData, success: true, status: 200 };
    }

    return { profile, success: true, status: 200 };
  } catch (err) {
    return { error: err?.message || 'Error resetting profile', status: 500 };
  }
}

export function normalizeDifficulty(diff) {
  if (!diff) return 'Easy';
  const lower = String(diff).trim().toLowerCase();
  if (lower === 'beginner' || lower === 'easy') return 'Easy';
  if (lower === 'intermediate' || lower === 'medium') return 'Intermediate';
  if (lower === 'advanced' || lower === 'hard') return 'Advanced';
  if (lower === 'expert' || lower === 'master' || lower === 'insane') return 'Expert';
  return 'Easy';
}

/**
 * Save a generated escape room question to the database
 */
export async function handleSaveQuestion(questionData, env) {
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured', status: 503 };
  }

  try {
    const payload = {
      question: questionData.question,
      domain: questionData.domain || 'Programming Fundamentals',
      tags: Array.isArray(questionData.tags) ? questionData.tags : [],
      difficulty: normalizeDifficulty(questionData.difficulty),
      title: questionData.title || null,
      scenario: questionData.scenario || null,
      code_snippet: questionData.code_snippet || questionData.codeSnippet || null,
      answer: Array.isArray(questionData.answer) ? questionData.answer : [String(questionData.answer || '')],
      hint: questionData.hint || null,
      explanation: questionData.explanation || null,
      sector_level: typeof questionData.sector_level === 'number' ? questionData.sector_level : (questionData.level || 1),
      created_by: questionData.created_by || null,
      created_at: new Date().toISOString(),
    };

    const { data: savedQuestion, error } = await supabase
      .from('generated_questions')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Notice: generated_questions table error:', error.message);
      return { error: error.message, status: 400 };
    }

    return { question: savedQuestion, success: true, status: 201 };
  } catch (err) {
    console.warn('Error saving generated question:', err?.message);
    return { error: err?.message || 'Failed to save question', status: 500 };
  }
}

/**
 * Fetch archived generated questions by domain, difficulty, tag, or sector
 */
export async function handleGetQuestions(filters = {}, env) {
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured', status: 503 };
  }

  try {
    let query = supabase.from('generated_questions').select('*').order('created_at', { ascending: false });

    if (filters.domain) {
      query = query.eq('domain', filters.domain);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', normalizeDifficulty(filters.difficulty));
    }
    if (filters.sector_level) {
      query = query.eq('sector_level', Number(filters.sector_level));
    }
    if (filters.limit) {
      query = query.limit(Number(filters.limit));
    } else {
      query = query.limit(50);
    }

    const { data: questions, error } = await query;
    if (error) {
      return { error: error.message, status: 400 };
    }

    return { questions: questions || [], status: 200 };
  } catch (err) {
    return { error: err?.message || 'Error fetching questions', status: 500 };
  }
}
