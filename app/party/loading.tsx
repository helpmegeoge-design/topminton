import { SkeletonPartyCard } from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-16 bg-muted rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
        <div className="space-y-4">
          <SkeletonPartyCard />
          <SkeletonPartyCard />
          <SkeletonPartyCard />
        </div>
      </div>
    </div>
  );
}
