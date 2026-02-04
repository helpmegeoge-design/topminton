"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook to update user's last_seen timestamp automatically
 * Updates every 2 minutes while user is active
 */
export function useOnlineStatus() {
    useEffect(() => {
        const updateLastSeen = async () => {
            const supabase = createClient();
            if (!supabase) return;

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Update last_seen in profiles
                await supabase
                    .from('profiles')
                    .update({ last_seen: new Date().toISOString() })
                    .eq('id', user.id);
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Error updating last_seen:', error);
                }
            }
        };

        // Update immediately on mount
        updateLastSeen();

        // Update every 2 minutes
        const interval = setInterval(updateLastSeen, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);
}
