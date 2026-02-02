"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { initializeLiff, login, getProfile, isLoggedIn, type LineProfile } from "@/lib/line-liff";

export default function LineLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [user, setUser] = useState<LineProfile | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const success = await initializeLiff();
        setIsLiffReady(success);
        
        if (success && isLoggedIn()) {
          const profile = await getProfile();
          if (profile) {
            setUser(profile);
            // Redirect if already logged in
            router.push("/");
          }
        }
      } catch (err) {
        console.error("LIFF init error:", err);
        setError("Failed to initialize LINE. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, [router]);

  const handleLineLogin = () => {
    if (!isLiffReady) {
      setError("LINE connection not ready. Please try again.");
      return;
    }
    login();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      {/* Logo & Brand */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-32 h-32 relative mb-6">
          <Image
            src="/images/mascot/pig-wave.jpg"
            alt="Topminton Mascot"
            fill
            className="object-contain"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">Topminton</h1>
        <p className="text-muted-foreground text-center max-w-xs mb-8">
          Join the badminton community. Find courts, match with players, and track your progress!
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm">
          <div className="puffy-card p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">🏸</span>
            </div>
            <p className="text-xs text-muted-foreground">Find Courts</p>
          </div>
          <div className="puffy-card p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">👥</span>
            </div>
            <p className="text-xs text-muted-foreground">Join Parties</p>
          </div>
          <div className="puffy-card p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">🏆</span>
            </div>
            <p className="text-xs text-muted-foreground">Tournaments</p>
          </div>
        </div>

        {error && (
          <div className="w-full max-w-sm mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {/* Login Button */}
      <div className="p-6 pb-8 safe-area-bottom space-y-4">
        <Button
          onClick={handleLineLogin}
          disabled={!isLiffReady}
          className="w-full h-14 text-lg font-semibold bg-[#06C755] hover:bg-[#05B54C] text-white rounded-2xl shadow-lg shadow-[#06C755]/25"
        >
          <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          Login with LINE
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-primary underline">Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" className="text-primary underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
