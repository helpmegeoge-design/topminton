import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShuttlecockIcon, HomeIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center px-4 text-center">
      {/* Animated Shuttlecock */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-float">
          <ShuttlecockIcon size={48} className="text-primary" />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/5 rounded-full blur-sm" />
      </div>

      {/* Error Code */}
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      
      {/* Message */}
      <h2 className="text-xl font-semibold text-foreground mb-2">ไม่พบหน้าที่คุณต้องการ</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบไปแล้ว หรือไม่เคยมีอยู่
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/">
          <Button className="gap-2">
            <HomeIcon size={18} />
            กลับหน้าหลัก
          </Button>
        </Link>
        <Link href="/help">
          <Button variant="outline" className="bg-transparent">
            ขอความช่วยเหลือ
          </Button>
        </Link>
      </div>

      {/* Fun Stats */}
      <div className="mt-12 p-4 bg-muted/50 rounded-xl">
        <p className="text-sm text-muted-foreground">
          ในระหว่างที่คุณหลงทาง มีคนตีแบดไปแล้ว{" "}
          <span className="font-semibold text-primary">1,234</span> แมตช์
        </p>
      </div>
    </div>
  );
}
