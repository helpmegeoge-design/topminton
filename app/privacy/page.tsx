import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4 flex items-center gap-3">
          <Link href="/more" className="p-2 -ml-2">
            <ArrowLeftIcon size={24} className="text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold">นโยบายความเป็นส่วนตัว</h1>
        </div>
      </div>

      <div className="p-4 prose prose-sm max-w-none">
        <p className="text-muted-foreground text-sm mb-6">อัปเดตล่าสุด: 29 มกราคม 2569</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            เราเก็บรวบรวมข้อมูลดังต่อไปนี้เมื่อคุณใช้งานแอปพลิเคชัน:
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li><strong>ข้อมูลบัญชี:</strong> อีเมล ชื่อ เบอร์โทรศัพท์</li>
            <li><strong>ข้อมูลโปรไฟล์:</strong> รูปโปรไฟล์ ระดับฝีมือ อุปกรณ์ที่ใช้</li>
            <li><strong>ข้อมูลการใช้งาน:</strong> ประวัติการเข้าร่วมก๊วน การแข่งขัน</li>
            <li><strong>ข้อมูลตำแหน่ง:</strong> เพื่อค้นหาคอร์ทใกล้เคียง (หากคุณอนุญาต)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">2. วิธีที่เราใช้ข้อมูล</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>เพื่อให้บริการและปรับปรุงแอปพลิเคชัน</li>
            <li>เพื่อจับคู่ก๊วนและผู้เล่นที่เหมาะสม</li>
            <li>เพื่อส่งการแจ้งเตือนเกี่ยวกับกิจกรรมที่คุณสนใจ</li>
            <li>เพื่อวิเคราะห์และปรับปรุงประสบการณ์การใช้งาน</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">3. การแบ่งปันข้อมูล</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            เราไม่ขายข้อมูลส่วนตัวของคุณ แต่อาจแบ่งปันข้อมูลกับ:
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>ผู้ใช้อื่นในก๊วนเดียวกัน (ชื่อ ระดับฝีมือ)</li>
            <li>ผู้ให้บริการที่ช่วยเราดำเนินงาน</li>
            <li>เมื่อกฎหมายกำหนด</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">4. ความปลอดภัยของข้อมูล</h2>
          <p className="text-muted-foreground leading-relaxed">
            เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ รวมถึงการเข้ารหัสข้อมูล และการจำกัดการเข้าถึงข้อมูล
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">5. สิทธิ์ของคุณ</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>เข้าถึงข้อมูลส่วนตัวของคุณ</li>
            <li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
            <li>ขอให้ลบข้อมูลของคุณ</li>
            <li>ยกเลิกการรับข่าวสารทางการตลาด</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">6. คุกกี้</h2>
          <p className="text-muted-foreground leading-relaxed">
            เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งาน คุณสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ได้ แต่อาจส่งผลต่อการใช้งานบางส่วน
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">7. การติดต่อ</h2>
          <p className="text-muted-foreground leading-relaxed">
            หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อได้ที่ privacy@topminton.app
          </p>
        </section>
      </div>
    </div>
  );
}
