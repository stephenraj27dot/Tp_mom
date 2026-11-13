import { createClient } from '@supabase/supabase-js';

// Environment variables or user-configured credentials in localStorage
const getStoredSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('tp_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('tp_supabase_anon_key') : null;

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  const isValid = url && key && url.startsWith('http') && key.length > 20;
  return { url, key, isValid };
};

let supabaseInstance = null;
const { url: initialUrl, key: initialKey, isValid: initialValid } = getStoredSupabaseConfig();
if (initialValid) {
  try {
    supabaseInstance = createClient(initialUrl, initialKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (err) {
    console.warn('[SupabaseService] Failed to init real Supabase client:', err);
  }
}

export const isSupabaseConfigured = () => {
  return !!supabaseInstance;
};

export const setCustomSupabaseConfig = (url, key) => {
  if (url && key) {
    localStorage.setItem('tp_supabase_url', url.trim());
    localStorage.setItem('tp_supabase_anon_key', key.trim());
    try {
      supabaseInstance = createClient(url.trim(), key.trim(), {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  } else {
    localStorage.removeItem('tp_supabase_url');
    localStorage.removeItem('tp_supabase_anon_key');
    supabaseInstance = null;
    return { success: true };
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// DEFAULT TEAM MEMBERS & LOCAL STORAGE MOCK DB (Works 100% Offline/Without Keys)
// ══════════════════════════════════════════════════════════════════════════════
const USERS_KEY = 'tamilpreneur_team_users';
const SESSION_KEY = 'tamilpreneur_team_session';
const ACTIVITY_KEY = 'tamilpreneur_user_activity';

const DEFAULT_TEAM = [
  {
    id: 'user_stephen_01',
    email: 'stephen@tamilpreneur.in',
    password: 'password123',
    fullName: 'Stephen Raj',
    teamRole: 'Tech & AI Lead',
    department: 'Tech & Product',
    avatar: 'SR',
    createdAt: '2026-01-10T09:00:00.000Z'
  },
  {
    id: 'user_shyam_02',
    email: 'sales@tamilpreneur.in',
    password: 'password123',
    fullName: 'Shyam Sundar',
    teamRole: 'Sales & Growth Specialist',
    department: 'Inbound Lead',
    avatar: 'SS',
    createdAt: '2026-01-15T10:30:00.000Z'
  },
  {
    id: 'user_priya_03',
    email: 'marketing@tamilpreneur.in',
    password: 'password123',
    fullName: 'Priya Dharshini',
    teamRole: 'Community & Marketing Manager',
    department: 'Marketing & Growth',
    avatar: 'PD',
    createdAt: '2026-02-01T11:00:00.000Z'
  }
];

const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_TEAM));
      return DEFAULT_TEAM;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TEAM;
  }
};

const saveLocalUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Could not save local users:', e);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION APIs
// ══════════════════════════════════════════════════════════════════════════════

export async function signUp({ email, password, fullName, teamRole = 'Team Member', department = 'General' }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !password || password.length < 6) {
    throw new Error('Please enter a valid work email and a password of at least 6 characters.');
  }

  // 1. If Supabase configured, register with Supabase Auth
  if (supabaseInstance) {
    try {
      const { data, error } = await supabaseInstance.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            team_role: teamRole,
            department
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        // Also insert into profiles table
        await supabaseInstance.from('profiles').upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: fullName,
          team_role: teamRole,
          department,
          updated_at: new Date().toISOString()
        });
      }
      return { user: data.user, session: data.session };
    } catch (err) {
      console.warn('[Supabase Auth] Cloud signUp failed, falling back to local team store:', err.message);
    }
  }

  // 2. Local Team Store Fallback
  const users = getLocalUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email address already exists in the team directory.');
  }

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TP';

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    password,
    fullName: fullName.trim(),
    teamRole: teamRole.trim(),
    department,
    avatar: initials,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveLocalUsers(users);

  // Auto login session
  const session = { user: newUser, token: `mock_jwt_${Date.now()}` };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  await logUserActivity({
    userId: newUser.id,
    action: 'account_created',
    details: `New team member account created: ${newUser.fullName} (${newUser.teamRole})`
  });

  return session;
}

export async function signIn({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Supabase Cloud Sign In
  if (supabaseInstance) {
    try {
      const { data, error } = await supabaseInstance.auth.signInWithPassword({
        email: cleanEmail,
        password
      });
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (err) {
      console.warn('[Supabase Auth] Cloud signIn failed, trying local directory:', err.message);
    }
  }

  // 2. Local Team Directory Check
  const users = getLocalUsers();
  const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!found) {
    throw new Error('No team account found with this email. Please click "Create Team Account" to join.');
  }

  if (found.password !== password) {
    throw new Error('Incorrect password. Please verify and try again.');
  }

  const session = { user: found, token: `mock_jwt_${Date.now()}` };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  await logUserActivity({
    userId: found.id,
    action: 'logged_in',
    details: `User logged into Tamilpreneur AI Studio: ${found.fullName}`
  });

  return session;
}

export async function signOut() {
  if (supabaseInstance) {
    try {
      await supabaseInstance.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
  }
  const curr = getCurrentUser();
  if (curr?.id) {
    await logUserActivity({
      userId: curr.id,
      action: 'logged_out',
      details: `User signed out from device.`
    });
  }
  localStorage.removeItem(SESSION_KEY);
  return { success: true };
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.user || null;
  } catch {
    return null;
  }
}

export async function updateProfile({ fullName, teamRole, department, avatar }) {
  const current = getCurrentUser();
  if (!current) throw new Error('Not authenticated');

  const updated = {
    ...current,
    fullName: fullName !== undefined ? fullName : current.fullName,
    teamRole: teamRole !== undefined ? teamRole : current.teamRole,
    department: department !== undefined ? department : current.department,
    avatar: avatar !== undefined ? avatar : current.avatar
  };

  // Update in local users
  const users = getLocalUsers();
  const idx = users.findIndex((u) => u.id === current.id);
  if (idx !== -1) {
    users[idx] = updated;
    saveLocalUsers(users);
  }

  // Update session
  const session = { user: updated, token: `mock_jwt_${Date.now()}` };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  if (supabaseInstance) {
    try {
      await supabaseInstance.from('profiles').upsert({
        id: updated.id,
        full_name: updated.fullName,
        team_role: updated.teamRole,
        department: updated.department,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase profile update warning:', e);
    }
  }

  return updated;
}

export function getTeamMembers() {
  return getLocalUsers().map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    teamRole: u.teamRole,
    department: u.department,
    avatar: u.avatar || u.fullName.slice(0, 2).toUpperCase()
  }));
}

// ══════════════════════════════════════════════════════════════════════════════
// PER-USER DATA ISOLATION (MOMs & Calls)
// ══════════════════════════════════════════════════════════════════════════════

export async function getUserRecords({ type = 'mom', userId }) {
  if (!userId) return [];

  // 1. Supabase Cloud Query
  if (supabaseInstance) {
    try {
      const table = type === 'call' ? 'call_records' : 'mom_records';
      const { data, error } = await supabaseInstance
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('[Supabase] Record query fallback:', e);
    }
  }

  // 2. Local User Storage Isolation
  const key = `tp_user_${userId}_${type}_records`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveUserRecord({ type = 'mom', record, userId }) {
  if (!userId || !record) return;

  const enrichedRecord = {
    ...record,
    userId,
    updatedAt: new Date().toISOString()
  };

  // 1. Supabase Cloud Sync
  if (supabaseInstance) {
    try {
      const table = type === 'call' ? 'call_records' : 'mom_records';
      await supabaseInstance.from(table).upsert({
        id: String(record.id),
        user_id: userId,
        title: record.title || (record.data?.lead?.company_name) || 'Untitled Record',
        department: record.department || 'General',
        data: record.data || record,
        summary: record.summary || record.conversation_summary,
        created_at: record.createdAt || new Date().toISOString()
      });
    } catch (e) {
      console.warn('[Supabase] Record save warning:', e);
    }
  }

  // 2. Local User Storage Isolation
  const key = `tp_user_${userId}_${type}_records`;
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((r) => r.id !== record.id);
    const updated = [enrichedRecord, ...filtered].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not persist isolated user record:', e);
  }

  await logUserActivity({
    userId,
    action: type === 'call' ? 'call_analyzed' : 'mom_synthesized',
    details: `${type === 'call' ? 'Sales Call Analyzed' : 'MOM Synthesized'}: "${enrichedRecord.title}"`
  });
}

export async function deleteUserRecord({ id, type = 'mom', userId }) {
  if (!userId || !id) return;

  if (supabaseInstance) {
    try {
      const table = type === 'call' ? 'call_records' : 'mom_records';
      await supabaseInstance.from(table).delete().eq('id', String(id)).eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase delete warning:', e);
    }
  }

  const key = `tp_user_${userId}_${type}_records`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.filter((r) => r.id !== id);
      localStorage.setItem(key, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Could not delete user record:', e);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// USER ACTIVITY & AUDIT TRAIL LOGGING
// ══════════════════════════════════════════════════════════════════════════════

export async function logUserActivity({ userId, action, details }) {
  if (!userId) return;

  const entry = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  };

  if (supabaseInstance) {
    try {
      await supabaseInstance.from('activity_logs').insert({
        user_id: userId,
        action_type: action,
        description: details,
        timestamp: entry.timestamp
      });
    } catch (e) {
      // ignore
    }
  }

  const key = `${ACTIVITY_KEY}_${userId}`;
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const updated = [entry, ...list].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not log activity:', e);
  }
}

export function getUserActivityLogs(userId) {
  if (!userId) return [];
  const key = `${ACTIVITY_KEY}_${userId}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
