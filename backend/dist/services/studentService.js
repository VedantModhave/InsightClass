import prisma from "../client.js";
import { Llm } from '@uptiqai/integrations-sdk';
export const PATTERNS = [
    {
        id: 'consistent-achievers',
        name: 'Consistent High-Engagers',
        description: 'Students who maintain high academic performance and steady participation.',
        characteristics: ['High submission consistency', 'Stable or positive trends', 'High participation'],
        color: '#10b981'
    },
    {
        id: 'emerging-potential',
        name: 'Quiet Contributors',
        description: 'Students with steady attendance but lower participation in class discussions.',
        characteristics: ['Consistent attendance', 'Lower verbal participation', 'Good written consistency'],
        color: '#3b82f6'
    },
    {
        id: 'unsteady-performers',
        name: 'Inconsistent Effort',
        description: 'Students showing fluctuating grades and engagement levels.',
        characteristics: ['Variable submission times', 'Inconsistent focus', 'Swing in scores'],
        color: '#f59e0b'
    },
    {
        id: 'at-risk-disengagement',
        name: 'Fragile Engagement',
        description: 'Students showing clear signs of declining interest or external barriers.',
        characteristics: ['Declining attendance', 'Late submissions', 'Negative score trends'],
        color: '#ef4444'
    }
];
export const STRATEGIES = {
    'consistent-achievers': {
        patternId: 'consistent-achievers',
        adjustments: ['Introduce advanced/extension materials', 'Offer peer-mentoring opportunities'],
        engagementTechniques: ['Deep-dive projects', 'Student-led inquiry'],
        assessmentChanges: ['Choice-based assessments', 'Project-based learning']
    },
    'emerging-potential': {
        patternId: 'emerging-potential',
        adjustments: ['Small group check-ins', 'Scaffolded participation opportunities'],
        engagementTechniques: ['Digital participation tools', 'Think-Pair-Share'],
        assessmentChanges: ['Lower-stakes formative check-ins', 'Written reflection options']
    },
    'unsteady-performers': {
        patternId: 'unsteady-performers',
        adjustments: ['Structured routines', 'Regular progress visualizers'],
        engagementTechniques: ['Gamified micro-goals', 'Frequent positive reinforcement'],
        assessmentChanges: ['Frequent low-stakes quizzes', 'Modular assignment chunks']
    },
    'at-risk-disengagement': {
        patternId: 'at-risk-disengagement',
        adjustments: ['One-on-one conference', 'Modified workload temporarily'],
        engagementTechniques: ['Connection-first outreach', 'Interests-based curriculum mapping'],
        assessmentChanges: ['Oral assessment alternatives', 'Flexible deadlines']
    }
};
export const analyzeStudent = (student) => {
    const riskReasons = [];
    const topFactors = [];
    // Academic Score Calculation Logic (ensure consistency with frontend)
    let academicScore = student.academicScore;
    if (academicScore === undefined || academicScore === null) {
        const ps = student.previousScores;
        const es = student.examScore;
        const hasPs = ps !== undefined && ps !== null;
        const hasEs = es !== undefined && es !== null;
        if (hasPs && hasEs) {
            academicScore = (0.6 * ps) + (0.4 * es);
        }
        else if (hasPs) {
            academicScore = ps;
        }
        else if (hasEs) {
            academicScore = es;
        }
        else {
            academicScore = null;
        }
    }
    const hasScore = academicScore !== null;
    const score = academicScore ?? 0;
    // Academic Trend
    let academicTrend = 'Stable';
    if (student.scoreTrend > 0.05)
        academicTrend = 'Improving';
    else if (student.scoreTrend < -0.05)
        academicTrend = 'Declining';
    // Attendance Trend
    let attendanceTrend = 'Flat';
    if (student.engagementTrend > 0.1)
        attendanceTrend = 'Up';
    else if (student.engagementTrend < -0.1)
        attendanceTrend = 'Down';
    // Engagement Level
    let engagementLevel = 'Medium';
    if (student.participationRate >= 0.85)
        engagementLevel = 'High';
    else if (student.participationRate < 0.6)
        engagementLevel = 'Low';
    // Last Activity
    let lastActivity = 'Unknown';
    if (student.lastSubmissionDaysAgo === 0)
        lastActivity = 'Today';
    else if (student.lastSubmissionDaysAgo === 1)
        lastActivity = 'Yesterday';
    else if (student.lastSubmissionDaysAgo < 7)
        lastActivity = `${student.lastSubmissionDaysAgo} days ago`;
    else
        lastActivity = `${Math.floor(student.lastSubmissionDaysAgo / 7)} week ago`;
    // Risk Detection
    let riskScore = 0;
    if (hasScore && academicScore < 65) {
        riskScore += 2;
        riskReasons.push(`Current academic score (${Math.round(academicScore)}%) is below the target threshold.`);
    }
    if (student.scoreTrend < -0.1) {
        riskScore += 2;
        riskReasons.push(`Academic performance has declined by ${Math.abs(Math.round(student.scoreTrend * 100))}% compared to baseline.`);
    }
    if (student.attendanceRate < 0.85) {
        riskScore += 2;
        riskReasons.push(`Attendance rate (${Math.round(student.attendanceRate * 100)}%) is below the classroom average.`);
    }
    if (student.lastSubmissionDaysAgo > 5) {
        riskScore += 1;
        riskReasons.push(`No work submitted in the last ${student.lastSubmissionDaysAgo} days.`);
    }
    if (student.engagementTrend < -0.2) {
        riskScore += 1;
        riskReasons.push(`Visible drop in classroom participation focus.`);
    }
    let riskLevel = 'Stable';
    if (riskScore >= 4)
        riskLevel = 'High Risk';
    else if (riskScore >= 2)
        riskLevel = 'Needs Attention';
    // Recent Change Insight
    let recentChangeInsight = "Maintaining consistent performance levels.";
    if (student.scoreTrend > 0.1)
        recentChangeInsight = "Academic performance is improving despite low participation.";
    else if (student.attendanceRate < 0.8 && student.attendanceRate < (student.historicalBaselineScore / 100))
        recentChangeInsight = "Attendance has declined over the past two weeks.";
    else if (student.lastSubmissionDaysAgo > 3)
        recentChangeInsight = "Recent submission gaps detected after consistent history.";
    else if (student.engagementTrend > 0.2)
        recentChangeInsight = "Significant increase in classroom engagement recently.";
    // Actionable Focus Areas - Empty State Handling
    if (riskReasons.length === 0) {
        const reassuringMessages = [
            "No immediate concerns detected. The student is currently demonstrating stable learning behaviors.",
            "Current indicators suggest this student is on track. Continue monitoring with regular check-ins.",
            "No urgent action required at this time. Maintain existing instructional approach."
        ];
        // Use rollNumber to pick a consistent message for the student
        const index = (parseInt(student.rollNumber) || 0) % reassuringMessages.length;
        riskReasons.push(reassuringMessages[index]);
    }
    // Fairness Explanation
    let fairnessExplanation = "";
    if (riskLevel === 'Stable') {
        const factors = [];
        if (student.attendanceRate > 0.9)
            factors.push("<b>consistent attendance</b>");
        if (academicTrend === 'Improving' || academicTrend === 'Stable')
            factors.push("<b>steady academic scores</b>");
        if (engagementLevel === 'High' || engagementLevel === 'Medium')
            factors.push("<b>active engagement</b>");
        fairnessExplanation = `Student shows strong protective factors including ${factors.join(', ')}. No immediate risk indicators detected.`;
    }
    // Pattern Discovery Logic
    let patternId = 'unsteady-performers';
    if (hasScore && score >= 85 && student.participationRate >= 0.8) {
        patternId = 'consistent-achievers';
    }
    else if (student.attendanceRate >= 0.9 && student.participationRate < 0.6) {
        patternId = 'emerging-potential';
    }
    else if (student.attendanceRate < 0.8 || student.scoreTrend < -0.15) {
        patternId = 'at-risk-disengagement';
    }
    // Dynamic Instructional Strategies
    const strategyExplanation = "These recommendations are tailored based on the student's recent performance, engagement, and learning pattern.";
    const baseStrategies = STRATEGIES[patternId] || STRATEGIES['unsteady-performers'];
    const instructionalStrategies = {
        adjustments: [...baseStrategies.adjustments],
        engagementTechniques: [...baseStrategies.engagementTechniques],
        assessmentApproach: [...baseStrategies.assessmentChanges]
    };
    // Personalize based on specific metrics
    if (academicTrend === 'Declining') {
        instructionalStrategies.adjustments.push('Implement targeted review sessions for recent weak topics');
        instructionalStrategies.assessmentApproach.push('Allow retakes on recent low-scoring assessments to rebuild confidence');
    }
    else if (academicTrend === 'Improving') {
        instructionalStrategies.adjustments.push('Provide "stretch" challenges to capitalize on recent momentum');
    }
    if (engagementLevel === 'Low') {
        instructionalStrategies.engagementTechniques.push('Assign a specific classroom role to increase sense of belonging');
        instructionalStrategies.engagementTechniques.push('Schedule a 2-minute non-academic check-in this week');
    }
    if (student.attendanceRate < 0.85) {
        instructionalStrategies.adjustments.push('Develop an attendance contract with small, achievable rewards');
    }
    if (patternId === 'emerging-potential' && riskLevel === 'Stable') {
        instructionalStrategies.engagementTechniques = [
            'Focus on low-pressure participation like "Think-Pair-Share"',
            'Encourage contributions through written or digital channels first',
            'Provide private positive reinforcement for any public contribution'
        ];
        instructionalStrategies.assessmentApproach = [
            'Offer reflective assessment options',
            'Use self-assessment rubrics to build confidence',
            'Value process-based participation as much as final output'
        ];
    }
    if (patternId === 'unsteady-performers' && riskLevel === 'Needs Attention') {
        instructionalStrategies.adjustments = [
            'Emphasize structured routines and daily goal setting',
            'Use progress visualizers to track work completion',
            'Provide a dedicated "focus zone" for independent work'
        ];
        instructionalStrategies.engagementTechniques.push('Frequent check-ins (every 20 minutes) during independent tasks');
    }
    if (patternId === 'at-risk-disengagement' && riskLevel === 'High Risk') {
        instructionalStrategies.adjustments = [
            'Prioritize connection-first outreach before academic demands',
            'Simplify task structures to reduce cognitive load and overwhelm',
            'Offer a "clean slate" opportunity for overdue work'
        ];
    }
    // Ensure variety by limiting to 3 items per section and shuffling slightly if we had more
    instructionalStrategies.adjustments = [...new Set(instructionalStrategies.adjustments)].slice(0, 3);
    instructionalStrategies.engagementTechniques = [...new Set(instructionalStrategies.engagementTechniques)].slice(0, 3);
    instructionalStrategies.assessmentApproach = [...new Set(instructionalStrategies.assessmentApproach)].slice(0, 3);
    // Contributing factors
    if (hasScore) {
        if (score > 85)
            topFactors.push('Strong weighted academic performance based on historical and recent results');
        else if (score < 50)
            topFactors.push('Academic challenges detected in combined performance metrics');
    }
    else {
        topFactors.push('Insufficient academic data for historical/exam weighted score');
    }
    if (student.submissionConsistency > 0.9)
        topFactors.push('Exceptional reliability in work submission');
    if (student.participationRate > 0.85)
        topFactors.push('Highly active in class discussions');
    if (student.scoreTrend > 0.1)
        topFactors.push('Strong upward academic trajectory');
    if (student.attendanceRate > 0.95)
        topFactors.push('Perfect or near-perfect attendance');
    if (topFactors.length === 0)
        topFactors.push('General adherence to classroom norms');
    return {
        ...student,
        academicScore,
        patternId,
        riskLevel,
        riskReasons,
        keyStrengths: topFactors.slice(0, 2),
        growthAreas: riskReasons.length > 0 ? riskReasons.slice(0, 2) : ['Consistent participation'],
        topContributingFactors: topFactors,
        recentChangeInsight,
        academicTrend,
        attendanceTrend,
        engagementLevel,
        lastActivity,
        fairnessExplanation,
        instructionalStrategies,
        strategyExplanation
    };
};
export const processStudentUpload = async (students) => {
    console.log(`Processing upload for ${students.length} students`);
    // Clear existing students (Soft delete)
    await prisma.student.updateMany({
        where: {
            OR: [
                { isDeleted: false },
                { isDeleted: { equals: null } }
            ]
        },
        data: { isDeleted: true }
    });
    if (students.length === 0) {
        console.log('No students provided in upload');
        return [];
    }
    const processedStudents = students.map(s => {
        const analysis = analyzeStudent(s);
        return {
            rollNumber: String(s.rollNumber),
            academicScore: analysis.academicScore,
            previousScores: s.previousScores,
            examScore: s.examScore,
            participationRate: s.participationRate,
            attendanceRate: s.attendanceRate,
            submissionConsistency: s.submissionConsistency,
            scoreTrend: s.scoreTrend,
            engagementTrend: s.engagementTrend,
            focusLevel: s.focusLevel,
            effortScore: s.effortScore,
            lastSubmissionDaysAgo: s.lastSubmissionDaysAgo,
            historicalBaselineScore: s.historicalBaselineScore,
            patternId: analysis.patternId,
            riskLevel: analysis.riskLevel,
            recentChangeInsight: analysis.recentChangeInsight,
            academicTrend: analysis.academicTrend,
            attendanceTrend: analysis.attendanceTrend,
            engagementLevel: analysis.engagementLevel,
            lastActivity: analysis.lastActivity,
            fairnessExplanation: analysis.fairnessExplanation,
            isDeleted: false
        };
    });
    console.log(`Saving ${processedStudents.length} processed students to DB`);
    await prisma.student.createMany({
        data: processedStudents
    });
    const result = await getStudentsWithInsights();
    console.log(`Returning ${result.length} students with insights`);
    return result;
};
export const getStudentsWithInsights = async () => {
    const students = await prisma.student.findMany({
        where: {
            OR: [
                { isDeleted: false },
                { isDeleted: { equals: null } }
            ]
        }
    });
    return students.map(s => analyzeStudent(s));
};
export const getStudentById = async (id) => {
    const student = await prisma.student.findUnique({
        where: { id, isDeleted: false }
    });
    if (!student)
        return null;
    return analyzeStudent(student);
};
export const getClassSummary = async () => {
    const insights = await getStudentsWithInsights();
    if (insights.length === 0)
        return null;
    const riskDist = {
        'Stable': 0,
        'Needs Attention': 0,
        'High Risk': 0
    };
    const patternCounts = {};
    PATTERNS.forEach(p => patternCounts[p.id] = 0);
    insights.forEach(ins => {
        riskDist[ins.riskLevel]++;
        patternCounts[ins.patternId]++;
    });
    const topPatterns = PATTERNS.map(p => ({
        name: p.name,
        count: patternCounts[p.id]
    })).sort((a, b) => b.count - a.count);
    const keyTrends = [];
    const avgAttendance = insights.reduce((acc, i) => acc + i.attendanceRate, 0) / insights.length;
    if (avgAttendance < 0.9)
        keyTrends.push('Overall class attendance is slightly below historical norms.');
    const decliningStudents = insights.filter(i => i.scoreTrend < -0.1).length;
    if (decliningStudents > insights.length * 0.2) {
        keyTrends.push(`Alert: ${Math.round((decliningStudents / insights.length) * 100)}% of students are showing a recent decline in performance.`);
    }
    // AI Summary Generation using LLM
    let aiSummary = "The class is showing varied engagement patterns across the board.";
    let recentChangesSummary = "Performance levels are holding steady with minor fluctuations in engagement.";
    let sevenDayTeachingPlan = [
        "Monitor students with minor engagement dips.",
        "Maintain current instructional pace.",
        "Encourage consistent participation."
    ];
    try {
        const provider = process.env.LLM_PROVIDER;
        if (provider) {
            const llm = new Llm({ provider });
            // Class summary prompt
            const summaryPrompt = `You are an educational consultant analyzing student data. 
      Class Statistics:
      - Total Students: ${insights.length}
      - Risk Distribution: Stable (${riskDist.Stable}), Needs Attention (${riskDist['Needs Attention']}), High Risk (${riskDist['High Risk']})
      - Top Patterns: ${topPatterns.map(p => `${p.name} (${p.count})`).join(', ')}
      - Key Trends: ${keyTrends.join(', ')}
      
      STRICT FORMATTING RULES:
      1. NEVER use markdown characters such as: **, *, _, or bullet asterisks.
      2. For bold emphasis, wrap the text in <b> tags (e.g., <b>High Risk Students</b>).
      3. Use clean text without any symbols.
      
      Provide a concise, teacher-friendly "Classroom Summary" in plain English (under 100 words). 
      Focus on learning patterns and actionable advice. Avoid technical ML language.`;
            // Recent changes prompt
            const recentChangesPrompt = `Analyze these recent student trends:
      - ${insights.map(i => `Student #${i.rollNumber}: ${i.recentChangeInsight}`).join('\n- ')}
      
      STRICT FORMATTING RULES:
      1. NEVER use markdown characters such as: **, *, _, or bullet asterisks.
      2. For bold emphasis, wrap the text in <b> tags.
      
      Generate a short (1-2 sentences) "What Changed Recently?" summary for the entire class. 
      Focus on trends that need instructional attention.`;
            // Teaching plan prompt
            const planPrompt = `Based on these insights, generate a "7-Day Teaching Plan".
      Insights:
      - ${keyTrends.join('\n- ')}
      - Top Patterns: ${topPatterns.map(p => p.name).join(', ')}
      
      Requirements:
      - Translate current insights into 3 short, time-bound actions.
      - Prioritize actions, not explanations.
      - Be readable in under 30 seconds.
      - Format: Return exactly 3 bullet points, each on a new line, no numbering.
      - Use the bullet character • followed by a space.
      - STRICTLY NO markdown symbols. Use <b> tags for emphasis if needed.`;
            const [summaryRes, changesRes, planRes] = await Promise.all([
                llm.generateText({ messages: [{ role: 'user', content: summaryPrompt }], model: process.env.LLM_MODEL }),
                llm.generateText({ messages: [{ role: 'user', content: recentChangesPrompt }], model: process.env.LLM_MODEL }),
                llm.generateText({ messages: [{ role: 'user', content: planPrompt }], model: process.env.LLM_MODEL })
            ]);
            if (summaryRes.text)
                aiSummary = summaryRes.text;
            if (changesRes.text)
                recentChangesSummary = changesRes.text;
            if (planRes.text) {
                sevenDayTeachingPlan = planRes.text.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^[-*•]\s*/, '').trim());
            }
        }
    }
    catch (error) {
        console.error('Error generating AI insights:', error);
    }
    return {
        overallRiskDistribution: riskDist,
        topPatterns,
        keyTrends,
        aiSummary,
        recentChangesSummary,
        sevenDayTeachingPlan
    };
};
