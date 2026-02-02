import { type NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";

const ExpenseBreakdownSchema = z.object({
  courtFee: z.object({
    totalHours: z.number(),
    pricePerHour: z.number(),
    total: z.number(),
  }),
  shuttlecocks: z.object({
    totalTubes: z.number(),
    pricePerTube: z.number(),
    total: z.number(),
  }),
  otherExpenses: z.array(z.object({
    name: z.string(),
    amount: z.number(),
  })),
  totalExpense: z.number(),
  totalMembers: z.number(),
  perPersonAmount: z.number(),
  breakdown: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const {
      courtHours,
      courtPricePerHour,
      shuttlecockTubes,
      shuttlecockPricePerTube,
      memberCount,
      otherExpenses,
    } = await request.json();

    // Calculate with AI for smart breakdown and summary
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      output: Output.object({ schema: ExpenseBreakdownSchema }),
      prompt: `Calculate the expense breakdown for a badminton session:
      
Court:
- Hours: ${courtHours || 2}
- Price per hour: ${courtPricePerHour || 200} THB

Shuttlecocks:
- Tubes used: ${shuttlecockTubes || 2}
- Price per tube: ${shuttlecockPricePerTube || 150} THB

Other expenses: ${otherExpenses ? JSON.stringify(otherExpenses) : "None"}

Total members: ${memberCount || 4}

Calculate:
1. Court fee total
2. Shuttlecock total
3. Total expense
4. Per person amount (rounded up to nearest 5 THB)
5. A friendly Thai-language breakdown message suitable for LINE sharing

Format the breakdown message like this example:
"สรุปค่าใช้จ่ายก๊วนแบด 🏸

📍 ค่าสนาม: X ชม. × Y บาท = Z บาท
🏸 ลูกแบด: X หลอด × Y บาท = Z บาท
💰 รวมทั้งหมด: X บาท
👥 จำนวนคน: X คน
✨ คนละ: X บาท

ขอบคุณที่มาเล่นด้วยกันครับ/ค่ะ 🙏"`,
    });

    return NextResponse.json({
      success: true,
      data: result.object,
    });
  } catch (error) {
    console.error("Error calculating expenses:", error);
    return NextResponse.json(
      { error: "Failed to calculate expenses" },
      { status: 500 }
    );
  }
}
