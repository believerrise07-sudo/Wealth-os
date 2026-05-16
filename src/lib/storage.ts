/**
 * WealthOS Pro Storage & Identity Utilities
 * Implementation of Critical Fixes 1, 2, and 3.
 */

import { Archetype, UserData } from '../types';

// Fix 1 — localStorage must never crash the app
export const safeGet = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn('Storage read error:', key, e);
    return fallback;
  }
};

export const safeSet = (key: string, value: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('Storage write error:', key, e);
    return false;
  }
};

export const safeRemove = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('Storage remove error:', key, e);
  }
};

// Fix 2 — User system must be airtight
export const getUsers = () => safeGet<Record<string, any>>('wo_users', {});
export const saveUsers = (users: Record<string, any>) => safeSet('wo_users', users);

export const getSession = () => {
  try { 
    return localStorage.getItem('wo_session'); 
  } catch { 
    return null; 
  }
};

export const setSession = (email: string) => {
  try { 
    localStorage.setItem('wo_session', email); 
  } catch(e) { 
    console.warn(e); 
  }
};

export const clearSession = () => {
  try { 
    localStorage.removeItem('wo_session'); 
  } catch(e) { 
    console.warn(e); 
  }
};

// Password hashing — simple but consistent
export const hashPassword = (password: string) => {
  try {
    return btoa(unescape(encodeURIComponent(password + '_wo_salt_2025'))).slice(0, 32);
  } catch {
    return btoa(password + '_wo_salt_2025').slice(0, 32);
  }
};

// Fix 3 — Default data must always be a FUNCTION not an object
export const createDefaultData = (): UserData => ({
  income: [],
  expenses: [],
  debts: [],
  ventures: [],
  budgets: [],
  assets: [],
  invoices: [],
  clients: [],
  chatHistory: [],
  profile: {
    name: '',
    email: '',
    currency: 'USD',
    sym: '$',
    mode: 'Single',
    goal: 'Save Money',
    archetype: Archetype.Builder,
    taxRate: 20,
    partnerName: '',
    businessName: '',
    onboarded: false
  }
});
