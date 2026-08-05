'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, ApiError } from './api-client';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  roles: string[];
  tenantId: string;
}

interface AuthContextType {
  user: UserSession | null;
  tenantId: string;
  isLoggedIn: boolean;
  isLoading: boolean;
  loginError: string | null;
  login: (emailSelect: string, passwordInput: string, tenantIdInput?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setTenantId: (tenantId: string) => void;
}

const DEFAULT_TENANT_ID = 'axiovital-general-hospital'; // default tenant slug or ID

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenantId: DEFAULT_TENANT_ID,
  isLoggedIn: false,
  isLoading: true,
  loginError: null,
  login: async () => false,
  logout: async () => {},
  setTenantId: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [tenantId, setTenantIdState] = useState<string>(DEFAULT_TENANT_ID);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    // Restore session on page load
    const savedUser = localStorage.getItem('axiovital_user_session');
    const savedTenant = localStorage.getItem('axiovital_tenant_id');
    const token = apiClient.getAccessToken();

    if (savedTenant) {
      setTenantIdState(savedTenant);
    }

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch {
        apiClient.clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const setTenantId = (id: string) => {
    setTenantIdState(id);
    localStorage.setItem('axiovital_tenant_id', id);
  };

  const login = async (emailSelect: string, passwordInput: string, targetTenantId?: string): Promise<boolean> => {
    setLoginError(null);
    const useTenant = targetTenantId || tenantId;

    if (!emailSelect || !passwordInput) {
      setLoginError('Please enter a username and password.');
      return false;
    }

    // Mock user data - any password works
    const mockUsers: Record<string, { firstName: string; lastName: string; displayName: string; roles: string[]; email: string }> = {
      administrator: { firstName: 'Admin', lastName: 'User', displayName: 'Administrator', roles: ['ADMIN', 'USER'], email: 'administrator@axiovital.com' },
      dr_stewart: { firstName: 'Herman', lastName: 'Stewart', displayName: 'Dr. Herman Stewart', roles: ['DOCTOR', 'USER'], email: 'dr.stewart@axiovital.com' },
      dr_sharma: { firstName: 'R.', lastName: 'Sharma', displayName: 'Dr. R. Sharma', roles: ['DOCTOR', 'USER'], email: 'dr.sharma@axiovital.com' },
      dr_iyer: { firstName: 'K.', lastName: 'Iyer', displayName: 'Dr. K. Iyer', roles: ['DOCTOR', 'USER'], email: 'dr.iyer@axiovital.com' },
      nurse_jenkins: { firstName: 'Nurse', lastName: 'Jenkins', displayName: 'Nurse Jenkins', roles: ['NURSE', 'USER'], email: 'nurse.jenkins@axiovital.com' },
    };

    const mockUser = mockUsers[emailSelect] || {
      firstName: emailSelect,
      lastName: '',
      displayName: emailSelect,
      roles: ['USER'],
      email: `${emailSelect}@axiovital.com`,
    };

    const userProfile: UserSession = {
      id: `mock-${emailSelect}`,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      displayName: mockUser.displayName,
      roles: mockUser.roles,
      tenantId: useTenant,
    };

    // Set mock tokens so session restore works
    apiClient.setTokens('mock-access-token', 'mock-refresh-token');
    setUser(userProfile);
    setIsLoggedIn(true);
    localStorage.setItem('axiovital_user_session', JSON.stringify(userProfile));
    localStorage.setItem('axiovital_tenant_id', useTenant);
    return true;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore cleanup error
    } finally {
      apiClient.clearTokens();
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenantId,
        isLoggedIn,
        isLoading,
        loginError,
        login,
        logout,
        setTenantId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
