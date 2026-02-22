# API Specification

## Students

### Upload Students
- **Endpoint**: `POST /students/upload`
- **Description**: Uploads student data for analysis and saves to database.
- **Request Body**: `StudentData[]`
- **Response**: `StudentInsight[]`
- **Authentication**: Unauthenticated

### Get All Students
- **Endpoint**: `GET /students`
- **Description**: Retrieves all students with their insights.
- **Response**: `StudentInsight[]`
- **Authentication**: Unauthenticated

### Get Student by ID
- **Endpoint**: `GET /students/:id`
- **Description**: Retrieves a single student's details and insights.
- **Response**: `StudentInsight`
- **Authentication**: Unauthenticated

### Get Class Summary
- **Endpoint**: `GET /students/summary`
- **Description**: Retrieves an AI-generated summary and class-level statistics, including the 7-day teaching plan.
- **Response**: `ClassroomSummary`
- **Authentication**: Unauthenticated

## AI

### AI Endpoints

#### POST /ai/chat
- **Description**: Conversational AI assistant for classroom insights with streaming support.
- **Request Body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "Who should I prioritize this week?" }
    ]
  }
  ```
- **Response**: Server-Sent Events (SSE) stream of AI response.

#### POST /ai/copilot
- **Description**: (Legacy) Get non-streaming AI response for a single message.
- **Request Body**:
  ```json
  {
    "message": "Who should I prioritize this week?"
  }
  ```
- **Response**: `{ "response": "string" }`

## Data Models

### StudentInsight
- Inherits `StudentData`
- `patternId`: `string`
- `riskLevel`: `RiskLevel`
- `recentChangeInsight`: `string`
- `academicTrend`: `'Improving' | 'Stable' | 'Declining'`
- `attendanceTrend`: `'Up' | 'Flat' | 'Down'`
- `engagementLevel`: `'Low' | 'Medium' | 'High'`
- `lastActivity`: `string`
- `fairnessExplanation?`: `string` (For Stable students)
- `instructionalStrategies?`: `{ adjustments: string[], engagementTechniques: string[], assessmentApproach: string[] }`
- `strategyExplanation?`: `string`

### ClassroomSummary
- `overallRiskDistribution`: `Record<RiskLevel, number>`
- `topPatterns`: `{ name: string; count: number }[]`
- `keyTrends`: `string[]`
- `aiSummary`: `string`
- `recentChangesSummary`: `string`
- `sevenDayTeachingPlan`: `string[]`
