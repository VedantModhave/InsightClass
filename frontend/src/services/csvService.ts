import Papa from 'papaparse';
import { StudentData } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const parseCSV = (file: File): Promise<StudentData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const mappedData: StudentData[] = results.data.map((row: any, index: number) => {
            const rollNumber = row.rollNumber || row.RollNo || `R-${1000 + index}`;
            
            // Academic Score Calculation Logic
            // Support both CSV headers (case insensitive/variant check)
            const prevRaw = row.Previous_Scores ?? row.previousScore ?? row.PreviousScores;
            const examRaw = row.Exam_Score ?? row.examScore ?? row.ExamScore;
            
            const ps = (prevRaw !== undefined && prevRaw !== null && prevRaw !== '') ? parseFloat(prevRaw) : NaN;
            const es = (examRaw !== undefined && examRaw !== null && examRaw !== '') ? parseFloat(examRaw) : NaN;
            
            let finalAcademicScore: number | null = null;
            
            if (!isNaN(ps) && !isNaN(es)) {
              // Both present: weighted average
              finalAcademicScore = (0.6 * ps) + (0.4 * es);
            } else if (!isNaN(ps)) {
              // Only previous present
              finalAcademicScore = ps;
            } else if (!isNaN(es)) {
              // Only exam present
              finalAcademicScore = es;
            }
            // If both are NaN, finalAcademicScore remains null (Insufficient Data)

            return {
              id: row.id || uuidv4(),
              rollNumber: rollNumber,
              academicScore: finalAcademicScore,
              previousScores: isNaN(ps) ? undefined : ps,
              examScore: isNaN(es) ? undefined : es,
              participationRate: parseFloat(row.participationRate || row.Participation || '0') / 100,
              attendanceRate: parseFloat(row.attendanceRate || row.Attendance || '0') / 100,
              submissionConsistency: parseFloat(row.submissionConsistency || row.Consistency || '0') / 100,
              scoreTrend: parseFloat(row.scoreTrend || row.Trend || '0'),
              engagementTrend: parseFloat(row.engagementTrend || '0'),
              focusLevel: parseFloat(row.focusLevel || '5'),
              effortScore: parseFloat(row.effortScore || '5'),
              lastSubmissionDaysAgo: parseInt(row.lastSubmissionDaysAgo || '0'),
              historicalBaselineScore: parseFloat(row.historicalBaselineScore || '70'),
            };
          });
          resolve(mappedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error),
    });
  });
};

export const generateMockCSV = (): string => {
  const students = [
    { roll: '101', prev: 94, exam: 89, participation: 95, attendance: 98, consistency: 95, trend: 0.05, lastSub: 1 },
    { roll: '102', prev: 90, exam: 85, participation: 85, attendance: 96, consistency: 90, trend: -0.02, lastSub: 2 },
    { roll: '103', prev: 75, exam: 68, participation: 45, attendance: 92, consistency: 65, trend: -0.08, lastSub: 4 },
    { roll: '104', prev: 68, exam: 60, participation: 30, attendance: 75, consistency: 40, trend: -0.15, lastSub: 8 },
    { roll: '105', prev: 82, exam: 89, participation: 20, attendance: 94, consistency: 80, trend: 0.02, lastSub: 3 },
    { roll: '106', prev: 72, exam: 87, participation: 70, attendance: 88, consistency: 75, trend: 0.12, lastSub: 1 },
    { roll: '107', prev: 95, exam: 95, participation: 98, attendance: 100, consistency: 98, trend: 0.01, lastSub: 0 },
    { roll: '108', prev: 65, exam: 52, participation: 25, attendance: 70, consistency: 30, trend: -0.25, lastSub: 12 },
    { roll: '109', prev: 80, exam: 85, participation: 60, attendance: 90, consistency: 85, trend: 0.05, lastSub: 2 },
    { roll: '110', prev: 78, exam: 70, participation: 55, attendance: 85, consistency: 60, trend: -0.05, lastSub: 5 },
  ];

  const headers = "rollNumber,Previous_Scores,Exam_Score,participationRate,attendanceRate,submissionConsistency,scoreTrend,lastSubmissionDaysAgo\n";
  const rows = students.map(s => 
    `${s.roll},${s.prev},${s.exam},${s.participation},${s.attendance},${s.consistency},${s.trend},${s.lastSub}`
  ).join("\n");

  return headers + rows;
};
