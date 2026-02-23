import { Hono } from 'hono';
import { Llm, LlmProvider } from '@uptiqai/integrations-sdk';
import { getStudentsWithInsights, getClassSummary } from '../services/studentService.ts';
import catchAsync from '../utils/catchAsync.ts';

const aiRoutes = new Hono();

aiRoutes.post('/chat', catchAsync(async (c) => {
  const { messages } = await c.req.json();
  
  console.log('🔵 /ai/chat endpoint called');
  console.log('📨 Messages received:', messages.length);
  
  const students = await getStudentsWithInsights();
  const summary = await getClassSummary();
  
  console.log('👥 Students loaded:', students.length);

  const provider = (process.env.LLM_PROVIDER || 'Google') as LlmProvider;
  const model = process.env.LLM_MODEL || 'gemini-2.0-flash';

  const llm = new Llm({ 
    provider,
    temperature: 0.3,  // Lower temperature for factual responses
    maxTokens: 800  // Increased for complete responses
  });

  // Check if the last message asks about a specific student
  const lastMessage = messages[messages.length - 1];
  console.log('📝 Last message object:', JSON.stringify(lastMessage, null, 2));
  
  // Handle different message formats (parts array or direct content)
  let messageContent = '';
  if (lastMessage?.parts && Array.isArray(lastMessage.parts)) {
    messageContent = lastMessage.parts
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join(' ');
  } else {
    messageContent = lastMessage?.content || lastMessage?.text || '';
  }
  
  console.log('📝 Message content:', messageContent);
  
  const studentMatch = messageContent?.match(/#?R-?\d+/i);
  console.log('🔍 Student match:', studentMatch);
  
  let enhancedContent = messageContent;
  
  if (studentMatch) {
    const rawMatch = studentMatch[0].replace('#', '').replace('-', '').toUpperCase();
    const rollNumber = rawMatch.startsWith('R') ? rawMatch : `R${rawMatch}`;
    
    console.log('🔍 Student Search:', {
      originalQuery: studentMatch[0],
      processedRollNumber: rollNumber,
      totalStudents: students.length,
      sampleRollNumbers: students.slice(0, 5).map(s => s.rollNumber)
    });
    
    // Try multiple matching strategies
    const student = students.find(s => {
      const sRoll = s.rollNumber?.toUpperCase().replace('-', '');
      const matches = sRoll === rollNumber || sRoll === `R${rollNumber}` || sRoll === rollNumber.replace('R', '');
      if (matches) {
        console.log('✅ Student found:', s.rollNumber);
      }
      return matches;
    });
    
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
• Engagement Level: ${student.engagementLevel}

IMPORTANT: This student EXISTS in the database. Provide their exact data above.`;
    } else {
      console.log('❌ Student not found. Searched for:', rollNumber);
      // Student not found - provide helpful context
      enhancedContent = `${lastMessage.content}

NOTE: Student "${studentMatch[0]}" was not found in the database. 
Available student IDs range from ${students[0]?.rollNumber} to ${students[students.length - 1]?.rollNumber}.
Please verify the student ID and try again.`;
    }
  }

  const systemPrompt = `You are "InsightClass AI", a helpful teaching copilot.
  
  CONTEXT:
  - Total Students: ${students.length}
  - Class Summary: ${summary?.aiSummary}
  - Risk Distribution: ${JSON.stringify(summary?.overallRiskDistribution)}
  
  CRITICAL INSTRUCTIONS:
  1. When student data is provided in the user message (marked as "STUDENT DATA FOR #..."), extract ONLY the specific information requested.
  2. If asked for "academic score", provide ONLY the academic score.
  3. If asked for "attendance", provide ONLY attendance.
  4. Do NOT provide all metrics unless explicitly asked for "all data" or "complete profile".
  5. Be concise - answer exactly what was asked, nothing more.
  
  FORMATTING:
  1. Use <b> tags for emphasis (not markdown).
  2. Use • for bullet points only when listing multiple items.
  3. For single values, just state the answer directly.
  
  EXAMPLES:
  - Question: "Give me academic score of R-1000" → Answer: "Student R-1000 has an academic score of 70.6%."
  - Question: "What is the attendance of R-1000?" → Answer: "Student R-1000 has an attendance rate of 84%."
  - Question: "Tell me about R-1000" → Answer: [Provide comprehensive overview]`;

  const combinedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(0, -1).map((m: any) => {
      // Convert parts format to content format for all messages
      let content = '';
      if (m?.parts && Array.isArray(m.parts)) {
        content = m.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join(' ');
      } else {
        content = m?.content || m?.text || '';
      }
      return { role: m.role, content };
    }),
    { role: lastMessage.role, content: enhancedContent }
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

  const llm = new Llm({ 
    provider,
    temperature: 0.3,  // Lower temperature for factual responses
    maxTokens: 800  // Increased for complete responses
  });
  
  // Smart data injection: only include relevant students based on query
  const studentMatch = message.match(/#?R-?\d+/i);
  let relevantStudentData = '';
  
  if (studentMatch) {
    // Query about specific student - include only that student's data
    const rawMatch = studentMatch[0].replace('#', '').replace('-', '').toUpperCase();
    const rollNumber = rawMatch.startsWith('R') ? rawMatch : `R${rawMatch}`;
    
    // Try multiple matching strategies
    const student = students.find(s => {
      const sRoll = s.rollNumber?.toUpperCase().replace('-', '');
      return sRoll === rollNumber || sRoll === `R${rollNumber}` || sRoll === rollNumber.replace('R', '');
    });
    
    if (student) {
      relevantStudentData = `
STUDENT #${student.rollNumber} DATA (FOUND IN DATABASE):
• Academic Score: ${student.academicScore !== null ? student.academicScore + '%' : 'Insufficient Data'}
• Participation: ${student.participationRate}%
• Attendance: ${student.attendanceRate}%
• Submission Consistency: ${(student.submissionConsistency * 100).toFixed(1)}%
• Risk Level: ${student.riskLevel}
• Pattern: ${student.patternId}
• Academic Trend: ${student.academicTrend}
• Engagement: ${student.engagementLevel}

IMPORTANT: Provide the exact data above. This student EXISTS.`;
    } else {
      relevantStudentData = `
STUDENT NOT FOUND: "${studentMatch[0]}" does not exist in the database.
Available range: R-1000 to R-${students.length + 999}
Please ask the teacher to verify the student ID.`;
    }
  } else if (message.toLowerCase().includes('high risk') || message.toLowerCase().includes('attention')) {
    // Query about high-risk students - include only high-risk students
    const highRiskStudents = students.filter(s => s.riskLevel === 'High Risk').slice(0, 10);
    relevantStudentData = `
HIGH RISK STUDENTS (Top 10):
${highRiskStudents.map(s => `• #${s.rollNumber}: ${s.riskReasons?.join(', ')}`).join('\n')}`;
  }
  
  const systemPrompt = `You are "InsightClass AI", a helpful teaching copilot. Provide concise, actionable responses.
  
  CONTEXT:
  - Total Students: ${students.length}
  - Class Summary: ${summary?.aiSummary}
  - Risk Distribution: ${JSON.stringify(summary?.overallRiskDistribution)}
  ${relevantStudentData}
  
  FORMATTING:
  1. Use <b> tags for emphasis.
  2. Use • for bullet points.
  3. Keep responses under 150 words.
  
  INSTRUCTIONS:
  1. Provide exact numbers when available.
  2. Be concise and actionable.
  3. Focus on what teachers should do next.`;

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
