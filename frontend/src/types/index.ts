export type RiskLevel = 'Stable' | 'Needs Attention' | 'High Risk';

export interface StudentData {
  id: string;
  rollNumber?: string;
  academicScore: number | null; // null represents "Insufficient Data"
  previousScores?: number;
  examScore?: number;
  participationRate: number;
  attendanceRate: number;
  submissionConsistency: number; // 0 to 1
  scoreTrend: number; // -1 to 1 (negative means declining)
  engagementTrend: number; // -1 to 1
  focusLevel: number; // 1-10
  effortScore: number; // 1-10
  lastSubmissionDaysAgo: number;
  historicalBaselineScore: number;
}

export interface LearningPattern {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  studentCount: number;
  color: string;
}

export interface StudentInsight extends StudentData {
  patternId: string;
  riskLevel: RiskLevel;
  riskReasons: string[];
  keyStrengths: string[];
  growthAreas: string[];
  topContributingFactors: string[];
  recentChangeInsight: string;
  academicTrend: 'Improving' | 'Stable' | 'Declining';
  attendanceTrend: 'Up' | 'Flat' | 'Down';
  engagementLevel: 'Low' | 'Medium' | 'High';
  lastActivity: string;
  fairnessExplanation?: string;
  instructionalStrategies?: {
    adjustments: string[];
    engagementTechniques: string[];
    assessmentApproach: string[];
  };
  strategyExplanation?: string;
}

export interface TeachingStrategy {
  patternId: string;
  adjustments: string[];
  engagementTechniques: string[];
  assessmentChanges: string[];
}

export interface ClassroomSummary {
  overallRiskDistribution: Record<RiskLevel, number>;
  topPatterns: { name: string; count: number }[];
  keyTrends: string[];
  aiSummary: string;
  recentChangesSummary: string;
  sevenDayTeachingPlan: string[];
}
