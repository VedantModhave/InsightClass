import { Hono } from 'hono';
import * as studentService from '../services/studentService.ts';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/ApiError.ts';

const studentRoutes = new Hono();

studentRoutes.post('/upload', catchAsync(async (c) => {
  const body = await c.req.json();
  if (!Array.isArray(body)) {
    throw new ApiError(400, 'Invalid data format. Expected an array of students.');
  }
  const result = await studentService.processStudentUpload(body);
  return c.json(result);
}));

studentRoutes.get('/', catchAsync(async (c) => {
  const result = await studentService.getStudentsWithInsights();
  return c.json(result);
}));

studentRoutes.get('/summary', catchAsync(async (c) => {
  const result = await studentService.getClassSummary();
  if (!result) {
    // Return a default empty summary instead of 404 to avoid frontend errors on empty states
    return c.json({
      overallRiskDistribution: { 'Stable': 0, 'Needs Attention': 0, 'High Risk': 0 },
      topPatterns: [],
      keyTrends: ['No student data available yet.'],
      aiSummary: 'Waiting for student data upload to generate classroom insights.',
      recentChangesSummary: 'No recent changes detected.',
      sevenDayTeachingPlan: []
    });
  }
  return c.json(result);
}));

studentRoutes.get('/:id', catchAsync(async (c) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    throw new ApiError(400, 'Invalid student ID');
  }
  const result = await studentService.getStudentById(id);
  if (!result) {
    throw new ApiError(404, 'Student not found');
  }
  return c.json(result);
}));

export default studentRoutes;
