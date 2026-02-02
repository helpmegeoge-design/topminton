import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4 flex items-center gap-3">
          <Link href="/more" className="p-2 -ml-2">
            <ArrowLeftIcon size={24} className="text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold">เงื่อนไขการใช้งาน</h1>
        </div>
      </div>

      <div className="p-4 prose prose-sm max-w-none">
        <p className="text-muted-foreground text-sm mb-6">อัปเดตล่าสุด: 29 มกราคม 2569</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">1. การยอมรับเงื่อนไข</h2>
          <p className="text-muted-foreground leading-relaxed">
            การใช้งานแอปพลิเคชัน Topminton ถือว่าคุณยอมรับและตกลงที่จะปฏิบัติตามเงื่อนไขการใช้งานฉบับนี้ หากคุณไม่ยอมรับเงื่อนไขเหล่านี้ กรุณาหยุดใช้งานแอปพลิเคชันทันที
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">2. การลงทะเบียนและบัญชีผู้ใช้</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>ผู้ใช้ต้องมีอายุ 13 ปีขึ้นไปจึงจะสามารถสร้างบัญชีได้</li>
            <li>ข้อมูลที่ให้ในการลงทะเบียนต้องเป็นความจริงและเป็นปัจจุบัน</li>
            <li>ผู้ใช้มีหน้าที่รักษาความปลอดภัยของรหัสผ่านบัญชีตนเอง</li>
            <li>ห้ามใช้บัญชีร่วมกับบุคคลอื่น</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">3. การใช้งานที่อนุญาต</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            คุณตกลงที่จะใช้แอปพลิเคชันเพื่อวัตถุประสงค์ที่ถูกกฎหมายเท่านั้น และจะไม่:
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>โพสต์เนื้อหาที่ผิดกฎหมาย หยาบคาย หรือละเมิดสิทธิ์ของผู้อื่น</li>
            <li>ใช้แอปพลิเคชันเพื่อส่งสแปมหรือโฆษณาที่ไม่ได้รับอนุญาต</li>
            <li>พยายามเข้าถึงบัญชีของผู้อื่นโดยไม่ได้รับอนุญาต</li>
            <li>ใช้ระบบอัตโนมัติเพื่อเข้าถึงแอปพลิเคชัน</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">4. TB Points และการแลกรางวัล</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>TB Points ไม่สามารถแลกเปลี่ยนเป็นเงินสดได้</li>
            <li>บริษัทขอสงวนสิทธิ์ในการเปลี่ยนแปลงอัตราการแลก TB Points</li>
            <li>TB Points ที่ไม่ได้ใช้งานภายใน 12 เดือนอาจหมดอายุ</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">5. การยกเลิกบัญชี</h2>
          <p className="text-muted-foreground leading-relaxed">
            บริษัทขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้ที่ละเมิดเงื่อนไขการใช้งานโดยไม่ต้องแจ้งล่วงหน้า
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">6. การติดต่อ</h2>
          <p className="text-muted-foreground leading-relaxed">
            หากมีคำถามเกี่ยวกับเงื่อนไขการใช้งาน สามารถติดต่อได้ที่ support@topminton.app
          </p>
        </section>
      </div>
    </div>
  );
}
