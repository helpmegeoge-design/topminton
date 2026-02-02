"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  initializeLiff,
  isLoggedIn as liffIsLoggedIn,
  login as liffLogin,
  logout as liffLogout,
  getProfile,
  getAccessToken,
  type LineProfile,
} from "@/lib/line-liff";

interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  isAdmin: boolean;
}

interface LineAuthContextType {
  user: User | null;
  lineProfile: LineProfile | null;
  isLoading: boolean;
  isLiffReady: boolean;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const LineAuthContext = createContext<LineAuthContextType | undefined>(undefined);

export function LineAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiffReady, setIsLiffReady] = useState(false);

  const supabase = createClient();

  // Initialize LIFF and check auth status
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      
      try {
        // Initialize LIFF
        const liffReady = await initializeLiff();
        setIsLiffReady(liffReady);

        if (liffReady && liffIsLoggedIn()) {
          // Get LINE profile
          const profile = await getProfile();
          setLineProfile(profile);

          if (profile) {
            // Sync with Supabase
            await syncUserWithSupabase(profile);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Sync LINE user with Supabase
  const syncUserWithSupabase = async (profile: LineProfile) => {
    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("line_user_id", profile.userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching user:", fetchError);
        return;
      }

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from("profiles")
          .update({
            display_name: profile.displayName,
            avatar_url: profile.pictureUrl,
            line_status_message: profile.statusMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("line_user_id", profile.userId)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating user:", updateError);
          return;
        }

        setUser({
          id: updatedUser.id,
          lineUserId: updatedUser.line_user_id,
          displayName: updatedUser.display_name,
          avatarUrl: updatedUser.avatar_url,
          email: updatedUser.email,
          isAdmin: updatedUser.is_admin,
        });
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from("profiles")
          .insert({
            line_user_id: profile.userId,
            display_name: profile.displayName,
            avatar_url: profile.pictureUrl,
            line_status_message: profile.statusMessage,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating user:", insertError);
          return;
        }

        setUser({
          id: newUser.id,
          lineUserId: newUser.line_user_id,
          displayName: newUser.display_name,
          avatarUrl: newUser.avatar_url,
          email: newUser.email,
          isAdmin: newUser.is_admin,
        });
      }
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  };

  const login = useCallback(() => {
    if (!isLiffReady) {
      console.error("LIFF not ready");
      return;
    }
    liffLogin(window.location.href);
  }, [isLiffReady]);

  const logout = useCallback(async () => {
    liffLogout();
    setUser(null);
    setLineProfile(null);
    window.location.reload();
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isLiffReady || !liffIsLoggedIn()) return;

    const profile = await getProfile();
    if (profile) {
      setLineProfile(profile);
      await syncUserWithSupabase(profile);
    }
  }, [isLiffReady]);

  const value: LineAuthContextType = {
    user,
    lineProfile,
    isLoading,
    isLiffReady,
    isLoggedIn: !!user && liffIsLoggedIn(),
    login,
    logout,
    refreshUser,
  };

  return (
    <LineAuthContext.Provider value={value}>
      {children}
    </LineAuthContext.Provider>
  );
}

export function useLineAuth() {
  const context = useContext(LineAuthContext);
  if (context === undefined) {
    throw new Error("useLineAuth must be used within a LineAuthProvider");
  }
  return context;
}
