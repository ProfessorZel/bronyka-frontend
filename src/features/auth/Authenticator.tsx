import { useApi } from '@/app/shared/api/useApi';
import { LOCAL_STORAGE_TOKEN_KEY, USERS_API } from '@/app/shared/constants';
import React, { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { Session, User } from './types';

interface AuthenticatorProps {
  children?: React.ReactNode;
}

interface AuthContext {
  session: Session | null;
  setSession: (session: Session) => void;
}

export function Authenticator({ children }: AuthenticatorProps) {
  const [session, setSession] = useState<Session | null>(null);
  const api = useApi();

  const isAuth = !!session?.accessToken;
  const isAppReady = isAuth && !!session.user;

  useEffect(() => {
    const savedSession = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (savedSession) setSession({ accessToken: savedSession, user: null });
  }, []);

  useEffect(() => {
    if (session?.accessToken) getUserSessionData();
  }, [session?.accessToken]);

  return (
    <AuthContext.Provider value={{ session, setSession }}>
      {isAuth && isAppReady ? (
        children
      ) : (
        <Login saveSession={saveSessionToken} />
      )}
    </AuthContext.Provider>
  );

  function saveSessionToken(accessToken: string) {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, accessToken);
    setSession({ accessToken, user: null });
  }

  function sessionReset() {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    setSession(null);
  }

  async function getUserSessionData() {
    try {
      if (!session) return;

      const { accessToken } = session;

      const res: User = await api.get(`${USERS_API}/me`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      });

      if (accessToken) {
        setSession({ accessToken, user: res });
      }
    } catch (err) {
      sessionReset();
    }
  }
}

export const AuthContext = React.createContext<AuthContext | null>(null);
