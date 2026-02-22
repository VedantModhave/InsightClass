import { Hono } from 'hono';
import { Llm } from '@uptiqai/integrations-sdk';
import { getStudentsWithInsights, getClassSummary } from "../services/studentService.js";
import catchAsync from "../utils/catchAsync.js";
const aiRoutes = new Hono();
aiRoutes.post('/chat', catchAsync(async (c) => {
    const { messages } = await c.req.json();
    const students = await getStudentsWithInsights();
    const summary = await getClassSummary();
    const provider = (process.env.LLM_PROVIDER || 'gemini');
    const model = process.env.LLM_MODEL;
    const llm = new Llm({ provider });
    const systemPrompt = `You are "InsightClass AI", a helpful, calm, and professional teaching copilot. 
  Your goal is to help teachers understand their classroom insights and suggest actionable next steps based ONLY on the provided data.
  
  CONTEXT:
  - Class Summary: ${summary?.aiSummary}
  - Recent Changes: ${summary?.recentChangesSummary}
  - 7-Day Teaching Plan: ${summary?.sevenDayTeachingPlan.join(', ')}
  - Risk Distribution: ${JSON.stringify(summary?.overallRiskDistribution)}
  - Key Trends: ${summary?.keyTrends.join(', ')}
  
  STUDENT INSIGHTS:
  ${students.map(s => `
  - Student #${s.rollNumber}: Risk=${s.riskLevel}, Pattern=${s.patternId}, Academic=${s.academicTrend}, Attendance=${s.attendanceTrend}, Engagement=${s.engagementLevel}, Recent Insight="${s.recentChangeInsight}", Actionable Areas: ${s.riskReasons.join('; ')}
  `).join('\n')}
  
  STRICT FORMATTING RULES:
  1. NEVER use markdown characters such as: **, *, _, or bullet asterisks.
  2. For bold emphasis, wrap the text in <b> tags (e.g., <b>High Risk Students</b>).
  3. For lists, use the bullet character • followed by a space instead of asterisks or dashes.
  4. Do NOT use any other markdown artifacts.
  5. Use clean bullet points and short paragraphs.
  6. If formatting cannot be applied, default to plain text with no symbols.
  
  STRICT INSTRUCTIONS:
  1. Use ONLY the context provided above. Do NOT invent data, metrics, or reference external sources.
  2. If a question cannot be answered with current insights, respond with: "Based on current data, there are no urgent concerns in this area." Then suggest monitoring or a general teaching focus.
  3. Be concise: Use 3–5 bullet points or short paragraphs.
  4. Use teacher-friendly language. Focus on ACTION, not technical explanation.
  5. Tone: Supportive, calm, professional.
  6. PRIORITY QUESTIONS: Reference students marked "High Risk" or "Needs Attention". Mention relevant learning patterns. Suggest clear next steps.
  7. Do NOT rank students or use negative labels.
  8. If asked about why someone is stable, mention protective factors.`;
    const combinedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];
    const response = await llm.createStream({
        messages: combinedMessages,
        model: model
    });
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    return c.body(response.data);
}));
aiRoutes.post('/copilot', catchAsync(async (c) => {
    const { message } = await c.req.json();
    const students = await getStudentsWithInsights();
    const summary = await getClassSummary();
    const provider = (process.env.LLM_PROVIDER || 'gemini');
    const model = process.env.LLM_MODEL;
    const llm = new Llm({ provider });
    const systemPrompt = `You are "InsightClass AI", a helpful, calm, and professional teaching copilot. 
  Your goal is to help teachers understand their classroom insights and suggest actionable next steps based ONLY on the provided data.
  
  CONTEXT:
  - Class Summary: ${summary?.aiSummary}
  - Recent Changes: ${summary?.recentChangesSummary}
  - 7-Day Teaching Plan: ${summary?.sevenDayTeachingPlan.join(', ')}
  - Risk Distribution: ${JSON.stringify(summary?.overallRiskDistribution)}
  - Key Trends: ${summary?.keyTrends.join(', ')}
  
  STUDENT INSIGHTS:
  ${students.map(s => `
  - Student #${s.rollNumber}: Risk=${s.riskLevel}, Pattern=${s.patternId}, Academic=${s.academicTrend}, Attendance=${s.attendanceTrend}, Engagement=${s.engagementLevel}, Recent Insight="${s.recentChangeInsight}", Actionable Areas: ${s.riskReasons.join('; ')}
  `).join('\n')}
  
  STRICT FORMATTING RULES:
  1. NEVER use markdown characters such as: **, *, _, or bullet asterisks.
  2. For bold emphasis, wrap the text in <b> tags (e.g., <b>High Risk Students</b>).
  3. For lists, use the bullet character • followed by a space instead of asterisks or dashes.
  4. Do NOT use any other markdown artifacts.
  5. Use clean bullet points and short paragraphs.
  6. If formatting cannot be applied, default to plain text with no symbols.
  
  STRICT INSTRUCTIONS:
  1. Use ONLY the context provided above.
  2. If a question cannot be answered with current insights, respond with: "Based on current data, there are no urgent concerns in this area."
  3. Be concise.
  4. Use teacher-friendly language.
  5. Tone: Supportive, calm, professional.`;
    const result = await llm.generateText({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ],
        model: model
    });
    return c.json({ response: result.text || "Based on current data, there are no urgent concerns in this area." });
}));
export default aiRoutes;
