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

    // Map login selection if needed (e.g. administrator -> administrator@axiovital.com)
    let email = emailSelect;
    if (!email.includes('@')) {
      const emailMap: Record<string, string> = {
        administrator: 'administrator@axiovital.com',
        dr_stewart: 'dr.stewart@axiovital.com',
        dr_sharma: 'dr.sharma@axiovital.com',
        dr_iyer: 'dr.iyer@axiovital.com',
        nurse_jenkins: 'nurse.jenkins@axiovital.com',
      };
      email = emailMap[emailSelect] || `${emailSelect}@axiovital.com`;
    }

    try {
      const res = await apiClient.post(`/auth/login/${useTenant}`, {
        email,
        password: passwordInput,
      });

      const tokenData = res?.data || res;

      if (tokenData?.accessToken && tokenData?.refreshToken) {
        apiClient.setTokens(tokenData.accessToken, tokenData.refreshToken);

        // Get user profile
        let userProfile: UserSession;
        try {
          const profileRes = await apiClient.get('/auth/profile');
          const profile = profileRes?.data || profileRes;
          userProfile = {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            displayName: profile.displayName || `${profile.firstName} ${profile.lastName}`,
            roles: profile.roles || [],
            tenantId: profile.tenantId || useTenant,
          };
        } catch {
          // Fallback user session object if profile call fails
          userProfile = {
            id: tokenData.userId || 'user-1',
            email,
            firstName: emailSelect,
            lastName: '',
            displayName: emailSelect,
            roles: tokenData.roles || ['USER'],
            tenantId: useTenant,
          };
        }

        setUser(userProfile);
        setIsLoggedIn(true);
        localStorage.setItem('axiovital_user_session', JSON.stringify(userProfile));
        localStorage.setItem('axiovital_tenant_id', useTenant);
        return true;
      }

      setLoginError('Invalid response from server.');
      return false;
    } catch (err: any) {
      const msg = err?.message || 'Invalid username or password';
      setLoginError(msg);
      return false;
    }
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
