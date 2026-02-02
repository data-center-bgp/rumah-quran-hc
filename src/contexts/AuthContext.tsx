import { createContext, useContext, useEffect, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import supabase, { fetchProfiles } from "../utils/supabase";
import { type Profile } from "../types/database";

interface AuthContextType {
  session: Session | null;
  userEmail: string | undefined;
  userName: string | undefined;
  userProfile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  userEmail: undefined,
  userName: undefined,
  userProfile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile helper
  const loadProfile = async (userId: string, token?: string) => {
    try {
      const { data: profile } = await fetchProfiles({
        filter: { column: "auth_user_id", value: userId },
        single: true,
        token: token,
      });

      if (profile) {
        const displayName = profile.name || profile.email;
        setUserName(displayName);
        setUserProfile(profile as Profile);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          setLoading(false);
          return;
        }

        const currentSession = data?.session;
        setSession(currentSession);
        setUserEmail(currentSession?.user?.email);

        if (currentSession?.user?.id && currentSession?.access_token) {
          await loadProfile(
            currentSession.user.id,
            currentSession.access_token,
          );
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUserEmail(newSession?.user?.email);

      if (newSession?.user?.id && newSession?.access_token) {
        await loadProfile(newSession.user.id, newSession.access_token);
      } else {
        setUserName(undefined);
        setUserProfile(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, userEmail, userName, userProfile, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
