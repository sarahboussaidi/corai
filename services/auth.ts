
import { User } from "../types";

const DB_KEY = "tawsil_users_db";

const getDB = (): Record<string, User> => {
  const str = localStorage.getItem(DB_KEY);
  return str ? JSON.parse(str) : {};
};

const saveDB = (db: Record<string, User>) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const AuthService = {
  register: (user: User) => {
    const db = getDB();
    if (db[user.email]) {
      throw new Error("USER_EXISTS");
    }
    db[user.email] = user;
    saveDB(db);
    return user;
  },

  login: (email: string, password?: string) => {
    const db = getDB();
    const user = db[email];
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    // Simple password check (In real app, hash this!)
    if (password && user.password !== password) {
      throw new Error("INVALID_CREDENTIALS");
    }
    return user;
  },

  // Simulates 1:N face matching
  loginWithFace: (): User => {
    const db = getDB();
    const users = Object.values(db);
    
    // In a real app, this would compare face embeddings.
    // For this mock, we simply check if ANY registered user has a photo.
    // We return the first valid one found to simulate a match.
    const matchedUser = users.find(u => !!u.photo);
    
    if (!matchedUser) {
      throw new Error("FACE_NOT_MATCHED");
    }
    return matchedUser;
  },

  updateUser: (email: string, updates: Partial<User>) => {
    const db = getDB();
    if (!db[email]) throw new Error("USER_NOT_FOUND");
    
    db[email] = { ...db[email], ...updates };
    saveDB(db);
    return db[email];
  },

  userExists: (email: string): boolean => {
    const db = getDB();
    return !!db[email];
  }
};
