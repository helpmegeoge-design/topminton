"use client";

import React from "react"

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Download, 
  Share2, 
  ChevronRight,
  Loader2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

const STYLE_OPTIONS = [
  {
    id: "professional",
    name: "Pro Player",
    description: "Official team jersey look",
    preview: "/images/ai-styles/professional.jpg",
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "champion",
    name: "Champion",
    description: "Victory celebration",
    preview: "/images/ai-styles/champion.jpg",
    color: "from-yellow-500 to-amber-600"
  },
  {
    id: "action",
    name: "Action Shot",
    description: "Dynamic mid-swing pose",
    preview: "/images/ai-styles/action.jpg",
    color: "from-red-500 to-orange-600"
  },
  {
    id: "casual",
    name: "Casual",
    description: "Friendly sports look",
    preview: "/images/ai-styles/casual.jpg",
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "anime",
    name: "Anime Style",
    description: "Cool anime character",
    preview: "/images/ai-styles/anime.jpg",
    color: "from-purple-500 to-pink-600"
  },
  {
    id: "mascot",
    name: "Mascot",
    description: "Cute 3D character",
    preview: "/images/ai-styles/mascot.jpg",
    color: "from-pink-400 to-rose-500"
  }
];

export default function AIProfilePhotoPage() {
  const [step, setStep] = useState<"upload" | "style" | "generating" | "result">("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setStep("style");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedStyle) return;

    setStep("generating");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: selectedStyle,
          faceImageUrl: uploadedImage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setStep("result");
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      setStep("style");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    const response = await fetch(generatedImage);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `topminton-ai-profile-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!generatedImage) return;
    
    try {
      await navigator.share({
        title: "My Topminton AI Profile",
        text: "Check out my AI-generated badminton profile!",
        url: generatedImage,
      });
    } catch (err) {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(generatedImage);
      alert("Link copied to clipboard!");
    }
  };

  const resetFlow = () => {
    setStep("upload");
    setUploadedImage(null);
    setSelectedStyle(null);
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/30">
        <div className="flex items-center gap-3 px-4 h-14 safe-area-top">
          <BackButton />
          <h1 className="text-lg font-semibold text-foreground">AI Profile Photo</h1>
          <div className="ml-auto">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </div>
      </header>

      <main className="p-4 pb-24">
        {/* Step 1: Upload Photo */}
        {step === "upload" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Create Your AI Profile</h2>
              <p className="text-muted-foreground">
                Upload a photo of your face and we will transform it into an awesome badminton player portrait!
              </p>
            </div>

            {/* Upload Area */}
            <div 
              className="puffy-card p-8 flex flex-col items-center justify-center min-h-[300px] cursor-pointer border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Upload Your Photo</p>
              <p className="text-sm text-muted-foreground text-center">
                Take a selfie or upload from gallery<br />
                Best results with clear face photos
              </p>
            </div>

            {/* Tips */}
            <div className="puffy-card p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Tips for best results:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Use a well-lit photo with your face clearly visible</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Face the camera directly for best face swap results</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Avoid photos with sunglasses or face coverings</span>
                </li>
              </ul>
            </div>

            {/* Skip option */}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => setStep("style")}
            >
              Skip and generate without my face
            </Button>
          </div>
        )}

        {/* Step 2: Select Style */}
        {step === "style" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Choose Your Style</h2>
              <p className="text-muted-foreground">
                Select a style for your AI-generated profile photo
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Uploaded Image Preview */}
            {uploadedImage && (
              <div className="flex items-center gap-3 p-3 puffy-card">
                <div className="w-16 h-16 rounded-xl overflow-hidden">
                  <Image
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Your photo"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Your Photo</p>
                  <p className="text-sm text-muted-foreground">Ready to transform</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadedImage(null);
                    setStep("upload");
                  }}
                >
                  Change
                </Button>
              </div>
            )}

            {/* Style Grid */}
            <div className="grid grid-cols-2 gap-3">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "puffy-card p-3 text-left transition-all",
                    selectedStyle === style.id && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <div className={cn(
                    "w-full aspect-square rounded-xl mb-3 bg-gradient-to-br flex items-center justify-center",
                    style.color
                  )}>
                    <Sparkles className="w-10 h-10 text-white/80" />
                  </div>
                  <p className="font-semibold text-foreground">{style.name}</p>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </button>
              ))}
            </div>

            {/* Generate Button */}
            <Button
              className="w-full h-14 text-lg puffy-button"
              disabled={!selectedStyle}
              onClick={handleGenerate}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate AI Profile
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground">Creating Your AI Profile...</h2>
              <p className="text-muted-foreground">
                This may take 10-30 seconds
              </p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === "result" && generatedImage && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Your AI Profile is Ready!</h2>
              <p className="text-muted-foreground">
                Looking awesome! Save or share your new profile photo
              </p>
            </div>

            {/* Generated Image */}
            <div className="puffy-card p-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src={generatedImage || "/placeholder.svg"}
                  alt="AI Generated Profile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-14 bg-transparent"
                onClick={handleDownload}
              >
                <Download className="w-5 h-5 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                className="h-14 bg-transparent"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>

            <Button
              className="w-full h-14 puffy-button"
              onClick={async () => {
                // Set as profile photo logic here
                alert("Profile photo updated!");
              }}
            >
              <Check className="w-5 h-5 mr-2" />
              Use as Profile Photo
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={resetFlow}
            >
              Generate Another
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
