import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ReminderContext {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  daysOverdue: number;
  reminderCount: number;
  businessName: string;
}

export async function generateReminder(
  context: ReminderContext,
): Promise<string> {
  let toneInstruction = "";
  if (context.daysOverdue <= 7) {
    toneInstruction =
      "Gentle & friendly nudge. Assume they simply forgot or missed the previous email. Keep it light.";
  } else if (context.daysOverdue <= 21) {
    toneInstruction =
      "Firm & direct. Make it clear that payment was expected previously and request a direct payment date.";
  } else {
    toneInstruction =
      "Final & serious. State clearly that this is an urgent matter, outline immediate payment expectations, and reference next steps or potential consequences if unpaid.";
  }
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: `You are an automated communication assistant writing on behalf of ${context.businessName}.
      Your objective is to generate clear, concise, and natural human-sounding email payment reminders.

      Rules:
      1. Do NOT sound like a generic automated system (e.g., avoid "AUTOMATED REMINDER #3" subject headers or rigid template structures).
      2. Avoid artificial AI conversational clichés (e.g., "I hope this email finds you well", "Kindly remit payment", "Please be advised").
      3. Output ONLY the email body. Do not include meta-commentary, notes, or subject line prefixes unless explicitly requested.
      4.  no "Dear Sir/Madam", no generic corporate language, keep it under 150 words, don't mention it's AI-generated`,
    messages: [
      {
        role: "user",
        content: `Draft email reminder #${context.reminderCount} using these exact details:
        - Client Name: ${context.clientName}
        - Invoice Number: ${context.invoiceNumber}
        - Balance Due: ${context.currency} ${context.amount}
        - Overdue Duration: ${context.daysOverdue} days

        Required Escalation Tone: ${toneInstruction}`,
      },
    ],
  });

  console.log(message);

  const block = message.content[0];
  if (block.type === "text") {
    return block.text;
  } else {
    throw new Error("Unexpected response format from Claude");
  }
}
