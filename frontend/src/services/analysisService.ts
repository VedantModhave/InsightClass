import { api } from '../lib/api';
import { StudentData, StudentInsight, ClassroomSummary, LearningPattern } from '../types';

export const PATTERNS: LearningPattern[] = [
  {
    id: 'consistent-achievers',
    name: 'Consistent High-Engagers',
    description: 'Students who maintain high academic performance and steady participation.',
    characteristics: ['High submission consistency', 'Stable or positive trends', 'High participation'],
    studentCount: 0,
    color: '#10b981' // emerald-500
  },
  {
    id: 'emerging-potential',
    name: 'Quiet Contributors',
    description: 'Students with steady attendance but lower participation in class discussions.',
    characteristics: ['Consistent attendance', 'Lower verbal participation', 'Good written consistency'],
    studentCount: 0,
    color: '#8b5cf6' // purple-500
  },
  {
    id: 'unsteady-performers',
    name: 'Inconsistent Effort',
    description: 'Students showing fluctuating grades and engagement levels.',
    characteristics: ['Variable submission times', 'Inconsistent focus', 'Swing in scores'],
    studentCount: 0,
    color: '#f59e0b' // amber-500
  },
  {
    id: 'at-risk-disengagement',
    name: 'Fragile Engagement',
    description: 'Students showing clear signs of declining interest or external barriers.',
    characteristics: ['Declining attendance', 'Late submissions', 'Negative score trends'],
    studentCount: 0,
    color: '#ef4444' // red-500
  }
];

export const STRATEGIES: Record<string, any> = {
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

export const uploadStudents = async (data: StudentData[]): Promise<StudentInsight[]> => {
  if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
    // In mock mode, we'd normally simulate analysis, but since we are migrating to backend
    // we should ideally have a mock response here if needed.
    // For now, let's assume the user wants real backend integration.
  }
  const response = await api.post('/students/upload', data);
  return response.data;
};

export const getAllStudents = async (): Promise<StudentInsight[]> => {
  const response = await api.get('/students');
  return response.data;
};

export const getStudentById = async (id: string): Promise<StudentInsight> => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const getClassSummary = async (): Promise<ClassroomSummary> => {
  const response = await api.get('/students/summary');
  return response.data;
};

export const askCopilot = async (message: string): Promise<string> => {
  const response = await api.post('/ai/copilot', { message });
  return response.data.response;
};