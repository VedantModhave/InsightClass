import { Hono } from 'hono';
import { Llm, LlmProvider } from '@uptiqai/integrations-sdk';
import { getStudentsWithInsights, getClassSummary } from '../services/studentService.ts';
import catchAsync from '../utils/catchAsync.ts';

const aiRoutes = new Hono();

aiRoutes.post('/chat', catchAsync(async (c) => {
  const { messages } = await c.req.json();
  const students = await getStudentsWithInsights();
  const summary = await getClassSummary();

  const provider = (process.env.LLM_PROVIDER || 'Google') as LlmProvider;
  const model = process.env.LLM_MODEL || 'gemini-2.0-flash';

  const llm = new Llm({ provider });

  // Check if the last message asks about a specific student
  const lastMessage = messages[messages.length - 1];
  const studentMatch = lastMessage?.content?.match(/#?R-?\d+/i);
  let enhancedContent = lastMessage?.content;
  
  if (studentMatch) {
    const rollNumber = studentMatch[0].replace('#', '').toUpperCase();
    const student = students.find(s => s.rollNumber?.toUpperCase() === rollNumber || s.rollNumber?.toUpperCase() === `R-${rollNumber}`);
    
    if (student) {
      enhancedContent = `${lastMessage.content}

STUDENT DATA FOR #${student.rollNumber}:
• Academic Score: ${student.academicScore !== null ? student.academicScore + '%' : 'Insufficient Data'}
• Participation Rate: ${student.participationRate}%
• Attendance Rate: ${student.attendanceRate}%
• Submission Consistency: ${(student.submissionConsistency * 100).toFixed(1)}%
• Score Trend: ${student.scoreTrend > 0 ? '+' : ''}${(student.scoreTrend * 100).toFixed(1)}%
• Engagement Trend: ${student.engagementTrend > 0 ? '+' : ''}${(student.engagementTrend * 100).toFixed(1)}%
• Focus Level: ${student.focusLevel}/10
• Effort Score: ${student.effortScore}/10
• Last Submission: ${student.lastSubmissionDaysAgo} days ago
• Risk Level: ${student.riskLevel}
• Pattern: ${student.patternId}
• Academic Trend: ${student.academicTrend}
• Attendance Trend: ${student.attendanceTrend}
• Engagement Level: ${student.engagementLevel}`;
    }
  }

  const systemPrompt = `You are "InsightClass AI", a helpful, calm, and professional teaching copilot. 
  Your goal is to help teachers understand their classroom insights and suggest actionable next steps based ONLY on the provided data.
  
  CONTEXT:
  - Total Students: ${students.length}
  - Class Summary: ${summary?.aiSummary}
  - Recent Changes: ${summary?.recentChangesSummary}
  - 7-Day Teaching Plan: ${summary?.sevenDayTeachingPlan.join(', ')}
  - Risk Distribution: ${JSON.stringify(summary?.overallRiskDistribution)}
  - Key Trends: ${summary?.keyTrends.join(', ')}
  
  AVAILABLE STUDENT DATA:
  I have access to detailed data for ${students.length} students including:
  - Academic Score (percentage)
  - Participation Rate (percentage)
  - Attendance Rate (percentage)
  - Submission Consistency (percentage)
  - Score Trend, Engagement Trend
  - Focus Level (1-10), Effort Score (1-10)
  - Risk Level, Learning Pattern
  - Academic/Attendance/Engagement Trends
  
  When asked about a specific student (by roll number like #R-1003), I will provide their exact numerical data.
  
  STRICT FORMATTING RULES:
  1. NEVER use markdown characters such as: **, *, _, or bullet asterisks.
  2. For bold emphasis, wrap the text in <b> tags (e.g., <b>High Risk Students</b>).
  3. For lists, use the bullet character • followed by a space instead of asterisks or dashes.
  4. Do NOT use any other markdown artifacts.
  5. Use clean bullet points and short paragraphs.
  6. If formatting cannot be applied, default to plain text with no symbols.
  
  CRITICAL DATA RULES:
  1. When asked about a specific student, find them in the data and provide EXACT NUMBERS.
  2. Format student data like: "Student #R-1003: Academic Score 85%, Attendance 92%, Participation 78%..."
  3. Do NOT round numbers unless specifically asked.
  4. If asked about percentages or metrics, always include the actual numbers from the data.
  
  STRICT INSTRUCTIONS:
  1. Use ONLY the context provided above. Do NOT invent data, metrics, or reference external sources.
  2. If a question cannot be answered with current insights, respond with: "Based on current data, there are no urgent concerns in this area."
  3. Be concise: Use 3–5 bullet points or short paragraphs.
  4. Use teacher-friendly language. Focus on ACTION, not technical explanation.
  5. Tone: Supportive, calm, professional.
  6. When asked about specific students, search the data and provide their exact metrics.`;

  const combinedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(0, -1),
    { ...lastMessage, content: enhancedContent }
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

  const provider = (process.env.LLM_PROVIDER || 'Google') as LlmProvider;
  const model = process.env.LLM_MODEL || 'gemini-2.0-flash';

  const llm = new Llm({ provider });
  
  const systemPrompt = `You are "InsightClass AI", a helpful, calm, and professional teaching copilot. 
  Your goal is to help teachers understand their classroom insights and suggest actionable next steps based ONLY on the provided data.
  
  CONTEXT:
  - Total Students: ${students.length}
  - Class Summary: ${summary?.aiSummary}
  - Recent Changes: ${summary?.recentChangesSummary}
  - 7-Day Teaching Plan: ${summary?.sevenDayTeachingPlan.join(', ')}
  - Risk Distribution: ${JSON.stringify(summary?.overallRiskDistribution)}
  - Key Trends: ${summary?.keyTrends.join(', ')}
  
  COMPLETE STUDENT DATA (with exact numbers):
  ${students.map(s => `
  Student #${s.rollNumber}:
  • Academic Score: ${s.academicScore !== null ? s.academicScore + '%' : 'Insufficient Data'}
  • Participation Rate: ${s.participationRate}%
  • Attendance Rate: ${s.attendanceRate}%
  • Submission Consistency: ${(s.submissionConsistency * 100).toFixed(1)}%
  • Risk Level: ${s.riskLevel}
  • Pattern: ${s.patternId}
  • Academic Trend: ${s.academicTrend}
  • Attendance Trend: ${s.attendanceTrend}
  • Engagement Level: ${s.engagementLevel}
  `).join('\n')}
  
  STRICT FORMATTING RULES:
  1. NEVER use markdown characters such as: **, *, _, or bullet asterisks.
  2. For bold emphasis, wrap the text in <b> tags (e.g., <b>High Risk Students</b>).
  3. For lists, use the bullet character • followed by a space instead of asterisks or dashes.
  4. Do NOT use any other markdown artifacts.
  5. Use clean bullet points and short paragraphs.
  6. If formatting cannot be applied, default to plain text with no symbols.
  
  CRITICAL DATA RULES:
  1. ALWAYS provide EXACT NUMBERS from the data above when asked about percentages, scores, or metrics.
  2. When asked about a specific student, provide ALL their numerical data first, then interpretation.
  3. Example: "Student #R-1003 has an Academic Score of 85%, Attendance Rate of 92%, Participation Rate of 78%..."
  4. Do NOT round numbers unless specifically asked. Use the exact values provided.
  
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
