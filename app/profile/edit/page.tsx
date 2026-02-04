"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LevelBadge, type Level } from "@/components/ui/level-badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";
import { ImageCropper } from "@/components/ui/image-cropper";

const levels: Level[] = ["beginner", "intermediate", "advanced", "strong", "pro", "champion"];

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [playFrequency, setPlayFrequency] = useState("");
  const [skillLevel, setSkillLevel] = useState<Level>("beginner");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  // User ID
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      if (!supabase) {
        router.push('/login');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && profile) {
        setDisplayName(profile.display_name || '');
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setBio(profile.bio || '');
        setPlayFrequency(profile.play_frequency || '');
        setSkillLevel(profile.skill_level || 'beginner');
        setAvatarUrl(profile.avatar_url || '');
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    const supabase = createClient();
    if (!supabase) {
      alert('ไม่สามารถเชื่อมต่อได้');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        bio: bio.trim() || null,
        play_frequency: playFrequency || null,
        skill_level: skillLevel,
      })
      .eq('id', userId);

    setSaving(false);

    if (error) {
      console.error('Update error:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
      router.refresh(); // Refresh to update cached data
      router.push('/profile');
    }
  };

  // 1. Handle File Select (triggered by input)
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Read file as Data URL for cropper
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setSelectedImageSrc(reader.result?.toString() || null);
      setCropperOpen(true);
    });
    reader.readAsDataURL(file);

    // Clear input so same file can be selected again
    event.target.value = '';
  };

  // 2. Handle Cropped Image Upload (triggered by cropper save)
  const uploadCroppedImage = async (imageBlob: Blob) => {
    if (!userId) return;
    setSaving(true);
    setCropperOpen(false); // Close modal

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('ไม่สามารถเชื่อมต่อได้');
      }

      const fileName = `${userId}-${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      // Convert Blob to File
      const file = new File([imageBlob], fileName, { type: 'image/jpeg' });

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      alert('อัปโหลดรูปโปรไฟล์สำเร็จ');

    } catch (error: any) {
      console.error('Avatar upload error:', error);
      alert('เกิดข้อผิดพลาด: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
      setSelectedImageSrc(null);
    }
  };

  if (loading) {
    return (
      <AppShell hideNav>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingShuttlecock />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideNav>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/profile" className="p-2 -ml-2 tap-highlight">
            <Icons.chevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-semibold text-lg">แก้ไขโปรไฟล์</h1>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-4">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/20 bg-muted relative">
              {saving && document.activeElement?.id === 'avatar-upload' ? (
                <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                </div>
              ) : null}
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icons.profile className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={saving}
            />

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-colors z-20"
            >
              <Icons.camera className="w-5 h-5" />
            </label>
          </div>
        </div>

        {/* Display Name */}
        <GlassCard className="p-4">
          <label className="text-sm text-muted-foreground">ชื่อที่แสดง (Display Name)</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="ชื่อที่จะแสดงในแอป"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            ถ้าไม่กรอก จะใช้ชื่อจริงแทน
          </p>
        </GlassCard>

        {/* First Name */}
        <GlassCard className="p-4">
          <label className="text-sm text-muted-foreground">ชื่อจริง *</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="ชื่อจริง"
            className="mt-1"
            required
          />
        </GlassCard>

        {/* Last Name */}
        <GlassCard className="p-4">
          <label className="text-sm text-muted-foreground">นามสกุล *</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="นามสกุล"
            className="mt-1"
            required
          />
        </GlassCard>

        {/* Bio */}
        <GlassCard className="p-4">
          <label className="text-sm text-muted-foreground">แนะนำตัว</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="เล่าเกี่ยวกับตัวคุณ, สไตล์การเล่น, ประสบการณ์..."
            rows={3}
            className="mt-1"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {bio.length}/500
          </p>
        </GlassCard>

        {/* Play Frequency */}
        <GlassCard className="p-4">
          <label className="text-sm text-muted-foreground">ความถี่ในการเล่น</label>
          <select
            value={playFrequency}
            onChange={(e) => setPlayFrequency(e.target.value)}
            className="w-full mt-1 p-2 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">เลือกความถี่</option>
            <option value="1-2 ครั้ง/สัปดาห์">1-2 ครั้ง/สัปดาห์</option>
            <option value="3-4 ครั้ง/สัปดาห์">3-4 ครั้ง/สัปดาห์</option>
            <option value="5+ ครั้ง/สัปดาห์">5+ ครั้ง/สัปดาห์</option>
            <option value="ทุกวัน">ทุกวัน</option>
            <option value="ไม่แน่นอน">ไม่แน่นอน</option>
          </select>
        </GlassCard>

        {/* Skill Level */}
        <GlassCard className="p-4">
          <label className="text-sm text-muted-foreground mb-3 block">
            ระดับฝีมือ (ประเมินตัวเอง)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {levels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSkillLevel(level)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all tap-highlight",
                  skillLevel === level
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/50"
                )}
              >
                <LevelBadge level={level} size="sm" />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            หรือ <Link href="/assessment/quiz" className="text-primary">ทำแบบทดสอบวัดระดับ</Link>
          </p>
        </GlassCard>

        {/* Info Card */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <Icons.info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">ข้อมูลที่บันทึก</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                ข้อมูลของคุณจะถูกบันทึกและแสดงในโปรไฟล์ ช่วยให้เพื่อนๆ รู้จักคุณมากขึ้น
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={selectedImageSrc}
        onCropComplete={uploadCroppedImage}
      />
    </AppShell>
  );
}
