import liff from "@line/liff";

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

let liffInitialized = false;

export async function initializeLiff(): Promise<boolean> {
  if (liffInitialized) return true;
  
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  
  if (!liffId) {
    console.error("LIFF ID is not configured");
    return false;
  }

  try {
    await liff.init({ liffId });
    liffInitialized = true;
    return true;
  } catch (error) {
    console.error("LIFF initialization failed:", error);
    return false;
  }
}

export function isLoggedIn(): boolean {
  if (!liffInitialized) return false;
  return liff.isLoggedIn();
}

export function login(redirectUri?: string): void {
  if (!liffInitialized) {
    console.error("LIFF not initialized");
    return;
  }
  
  liff.login({ redirectUri });
}

export function logout(): void {
  if (!liffInitialized) return;
  liff.logout();
}

export async function getProfile(): Promise<LineProfile | null> {
  if (!liffInitialized || !liff.isLoggedIn()) {
    return null;
  }

  try {
    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    };
  } catch (error) {
    console.error("Failed to get LINE profile:", error);
    return null;
  }
}

export function getAccessToken(): string | null {
  if (!liffInitialized) return null;
  return liff.getAccessToken();
}

export function getIdToken(): string | null {
  if (!liffInitialized) return null;
  return liff.getIDToken();
}

export function isInClient(): boolean {
  if (!liffInitialized) return false;
  return liff.isInClient();
}

export function closeWindow(): void {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
}

export async function shareMessage(messages: Array<{ type: string; text?: string; originalContentUrl?: string; previewImageUrl?: string }>): Promise<boolean> {
  if (!liffInitialized || !liff.isInClient()) {
    return false;
  }

  try {
    await liff.shareTargetPicker(messages as any);
    return true;
  } catch (error) {
    console.error("Failed to share message:", error);
    return false;
  }
}

export function openWindow(url: string, external?: boolean): void {
  if (!liffInitialized) {
    window.open(url, "_blank");
    return;
  }
  
  liff.openWindow({ url, external });
}

export function sendMessages(messages: Array<{ type: string; text: string }>): Promise<void> {
  if (!liffInitialized || !liff.isInClient()) {
    return Promise.reject(new Error("Cannot send messages outside LINE"));
  }
  
  return liff.sendMessages(messages as any);
}
