# InsightClass - Teacher Dashboard for Data-Driven Student Insights

InsightClass is a professional, AI-powered dashboard designed for teachers to monitor student performance, engagement, and behavioral trends. It transforms raw student data into actionable instructional strategies, helping teachers identify students at risk and prioritize support efforts effectively.

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 (Modern, utility-first styling)
- **Animations**: Framer Motion
- **Charts**: Recharts (Risk distribution, learning patterns)
- **Icons**: Lucide React
- **AI Integration**: `@ai-sdk/react` for streaming assistant responses
- **Backend Communication**: Hono (Backend), Axios (Frontend)

---

## 🛠 Core Features & Logic

### 1. "Ask InsightClass" AI Copilot
- **Placement**: Floating action button (FAB) at the **bottom-right** of the dashboard.
- **Interaction**: Opens a slide-up panel/modal for context-aware queries.
- **Strict Formatting Rules**: 
    - **NO raw markdown symbols** (e.g., `*`, `_`, `**`, `###`).
    - Use HTML `<b>` tags for bold text.
    - Use `•` (bullet symbol) for lists.
    - Assistant uses dangerouslySetInnerHTML on the frontend to render these safely.
- **Knowledge Scope**: Grounded ONLY in current class data (Learning Patterns, Trends, Risk Summaries).

### 2. Classroom Overview & AI Analytics
- **Temporal Insights**: "Recent Change Insights" that surface ONE primary change per student (e.g., "Attendance has declined over the past two weeks").
- **7-Day Teaching Plan**: AI-generated, time-bound focus areas (e.g., "Prioritize check-ins with Fragile Engagement learners").
- **Explanatory Fairness**: Explicitly explains why "Stable" students are not at risk to avoid alarmism.

### 3. Student Insights Table
- **Advanced Filtering**: Combine Risk Status, Learning Pattern, Academic Trend, and Attendance Range logic.
- **Enhanced Columns**:
    - **Academic Trend**: Improving / Stable / Declining (derived from scores).
    - **Attendance Trend**: Up / Flat / Down (with percentage values displayed from CSV).
    - **Last Activity**: Relative time (e.g., "Today", "3 days ago").
- **Empty State**: Displays a clean "No data found" message when filters return no results.

### 4. Student Profiles (Deep Dive)
- **Personalized Instructional Strategies**: Dynamically generated based on Learning Pattern, Academic Score, and Trend.
    - **Classroom Adjustments**
    - **Engagement Techniques**
    - **Assessment Approach**
- **Actionable Focus Areas**: Data-backed observations or a positive "On track" message if no issues are detected (never empty).

---

## 📁 Project Structure

```text
src/
├── agentSdk/          # AI agent configuration (id, widgetKey, triggerEvents)
├── components/        
│   ├── common/        # Sidebar, Layout
│   └── dashboard/     
│       ├── Dashboard.tsx       # Main overview with filters and table
│       ├── StudentDetails.tsx # Detailed profile view
│       └── AskInsightClass.tsx # Floating AI assistant component
├── lib/               # api.ts (Axios client), utils.ts
├── services/          
│   ├── analysisService.ts     # Data processing and summary logic
│   └── csvService.ts          # CSV parsing logic (PapaParse)
├── types/             # TypeScript interfaces (StudentInsight, LearningPattern, etc.)
├── App.tsx            # Routes and main layout
└── main.tsx           # Entry point
```

---

## 🎨 UI & UX Guidelines for Gemini Enhancements

When enhancing the UI, strictly follow these mandates:

1.  **Professional Aesthetic**: Clean, modern, and "Professional UI" style. No unnecessary "jazzy" elements.
2.  **Teacher-First Language**: Supportive, non-technical tone. Focus on "Support" not "Automation."
3.  **No Student Ranking**: Never compare students directly or show leaderboards.
4.  **Formatting Consistency**: Ensure the AI Copilot never outputs markdown characters. Use the strict bold/bullet rules mentioned above.
5.  **Data Integrity**: Use `?.` optional chaining for all data access to prevent crashes.
6.  **Responsive Design**: Ensure the sidebar and floating assistant don't overlap critical content.

---

## 🔌 Environment Variables
- `VITE_USE_MOCK_DATA`: Set to `true` to use local mock data.
- `VITE_API_BASE_URL`: Base URL for the backend API.