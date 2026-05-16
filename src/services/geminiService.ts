import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface FinancialContext {
  name: string;
  goal: string;
  archetype: string;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  debt: number;
  savingsRate: number;
  incomeSources: any[];
  topExpenses: any[];
  allDebts: any[];
  allVentures: any[];
}

export async function getFinancialAdvice(context: FinancialContext, userMessage: string, chatHistory: { role: "user" | "model"; parts: string }[] = []) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to your secrets.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const contextString = `
    User Name: ${context.name}
    Goal: ${context.goal}
    Archetype: ${context.archetype}
    Total Monthly Income: ${context.totalIncome}
    Total Monthly Expenses: ${context.totalExpenses}
    Net Monthly Cash Flow: ${context.netFlow}
    Total Debt: ${context.debt}
    Savings Rate: ${context.savingsRate}%
    Income Sources: ${JSON.stringify(context.incomeSources)}
    Top Expenses: ${JSON.stringify(context.topExpenses)}
    Debts: ${JSON.stringify(context.allDebts)}
    Ventures & Acquisitions: ${JSON.stringify(context.allVentures)}
  `;

  const systemPrompt = `
    You are the WealthOS Sovereign Strategist, a world-class Private Equity and Venture Capital analyst.
    You possess total transparency into this Family Office's data:
    ${contextString}

    STRICT GUIDELINES:
    1. ARCHE TYPE: 'Quiet Luxury'. Your tone is elite, detached yet focused, and hyper-precise. No fluff. No standard commercial bank advice.
    2. LANGUAGE: Use professional finance terminology where appropriate (TVPI, IRR, Alpha, Basis Points, Liquidity Events).
    3. DATA-DRIVEN: Reference their exact figures (e.g., "$${context.netFlow} net monthly liquidity") to provide surgical advice.
    4. STRATEGY: Treat their life as a high-stakes portfolio. If they have high debt, call it "toxic leverage". If they have low ventures, suggest "diversifying into alternative assets".
    5. FORMATTING: Use clean, structured output. No emojis. Bold key metrics only.
    6. GOAL: Maximize their net worth and accelerate toward their stated goal: "${context.goal}".
  `;

  const chat = model.startChat({
    history: chatHistory.map(h => ({
      role: h.role,
      parts: [{ text: h.parts }]
    })),
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  // Inject system prompt as the first message if history is empty, or as a prefix
  const prompt = chatHistory.length === 0 
    ? `${systemPrompt}\n\nUser: ${userMessage}`
    : userMessage;

  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  return response.text();
}
