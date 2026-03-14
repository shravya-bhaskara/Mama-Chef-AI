import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  userId: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Generate or retrieve a device-specific user ID
function getOrCreateUserId(): string {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('mama-chef-user-id');
    if (!userId) {
      // Generate a unique device ID
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('mama-chef-user-id', userId);
    }
    return userId;
  }
  return 'default-user';
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId] = useState<string>(getOrCreateUserId());

  return (
    <UserContext.Provider value={{ userId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
