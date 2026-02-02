import { type NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";

const SlipVerificationSchema = z.object({
  isValid: z.boolean(),
  bankName: z.string().nullable(),
  accountName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  amount: z.number().nullable(),
  transactionDate: z.string().nullable(),
  transactionTime: z.string().nullable(),
  referenceNumber: z.string().nullable(),
  confidence: z.number(), // 0-100
  matchesExpectedAmount: z.boolean().nullable(),
  issues: z.array(z.string()),
  summary: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const slipImage = formData.get("slip") as File;
    const expectedAmount = formData.get("expectedAmount") as string;
    const expectedAccountName = formData.get("expectedAccountName") as string;

    if (!slipImage) {
      return NextResponse.json(
        { error: "Slip image is required" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await slipImage.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = slipImage.type || "image/jpeg";

    // Use AI to verify the slip
    const result = await generateText({
      model: "openai/gpt-4o",
      output: Output.object({ schema: SlipVerificationSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this Thai bank transfer slip image and extract the following information:

1. Bank name (ธนาคาร)
2. Sender/payer account name (ชื่อบัญชีผู้โอน)
3. Sender account number (เลขบัญชีผู้โอน) 
4. Transfer amount (จำนวนเงิน)
5. Transaction date (วันที่)
6. Transaction time (เวลา)
7. Reference/transaction number (เลขอ้างอิง)

Expected amount to verify: ${expectedAmount ? `${expectedAmount} THB` : "Not specified"}
Expected recipient name: ${expectedAccountName || "Not specified"}

Determine:
- Is this a valid bank transfer slip?
- Does the amount match the expected amount (if specified)?
- Confidence level (0-100) based on image clarity and completeness
- Any issues or concerns with the slip

Provide a summary in Thai suitable for displaying to users.`,
            },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64Image}`,
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      success: true,
      verification: result.object,
    });
  } catch (error) {
    console.error("Error verifying slip:", error);
    return NextResponse.json(
      { error: "Failed to verify slip" },
      { status: 500 }
    );
  }
}
