import { SkeletonList, SkeletonProfile } from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
        <SkeletonProfile />
        <SkeletonList count={5} />
      </div>
    </div>
  );
}
