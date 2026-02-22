import React, { useState, useEffect } from 'react';
import { StudentData, StudentInsight, ClassroomSummary, LearningPattern } from './types';
import { parseCSV, generateMockCSV } from './services/csvService';
import { uploadStudents, getClassSummary, getAllStudents } from './services/analysisService';
import Dashboard from './components/dashboard/Dashboard';
import StudentDetails from './components/dashboard/StudentDetails';
import Sidebar from './components/common/Sidebar';
import { Upload, Database, FileText, Users, AlertTriangle, GraduationCap, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [students, setStudents] = useState<StudentInsight[]>([]);
  const [summary, setSummary] = useState<ClassroomSummary | null>(null);
  const [summaryError, setSummaryError] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const progressIntervalRef = React.useRef<any>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setSummaryError(false);
    setUploadProgress(5); // Start with a small progress so it's visible immediately
    
    // Progress increment helper
    const startProgressAt = (start: number, end: number, duration: number) => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setUploadProgress(start);
      const step = (end - start) / (duration / 100);
      let current = start;
      progressIntervalRef.current = setInterval(() => {
        current += step;
        if (current >= end) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        } else {
          setUploadProgress(Math.floor(current));
        }
      }, 100);
    };

    try {
      console.log('Starting file upload:', file.name);
      startProgressAt(5, 40, 150); // Faster parsing phase
      
      const rawData = await parseCSV(file);
      console.log('Parsed CSV data:', rawData.length, 'students');
      
      startProgressAt(40, 80, 250); // Faster upload and Analyze phase
      const insights = await uploadStudents(rawData);
      console.log('Received insights from server:', insights.length, 'students');
      
      startProgressAt(80, 98, 150); // Faster summary phase
      let classSummary: ClassroomSummary | null = null;
      try {
        classSummary = await getClassSummary();
        console.log('Received class summary');
      } catch (err) {
        console.error('Failed to get summary after upload', err);
        setSummaryError(true);
      }
      
      // Stop any background progress and jump to 100
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setUploadProgress(100);
      
      // Brief pause for user to see completion
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // NOW update the states that trigger dashboard rendering
      setStudents(insights);
      if (classSummary) {
        setSummary(classSummary);
        setSummaryError(false);
      }
      setSelectedStudentId(null);
      
    } catch (error) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      console.error('Failed to parse or analyze CSV', error);
      alert('Error processing data. Please ensure it follows the required format and server is running.');
      setUploadProgress(0);
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    const mockCSV = generateMockCSV();
    const blob = new Blob([mockCSV], { type: 'text/csv' });
    const file = new File([blob], 'demo_classroom.csv', { type: 'text/csv' });
    handleFileUpload(file);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onUpload={handleFileUpload}
        onLoadMock={loadMockData}
        hasData={students.length > 0}
        activeView={selectedStudentId ? 'student' : 'dashboard'}
        onViewChange={(view) => {
          view === 'dashboard' && setSelectedStudentId(null);
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 overflow-y-auto relative bg-background flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between pt-28 pb-4 px-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <GraduationCap size={20} />
            </div>
            <span className="font-black text-lg tracking-tight">InsightClass</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <div className="w-6 h-0.5 bg-foreground mb-1" />
            <div className="w-6 h-0.5 bg-foreground mb-1" />
            <div className="w-6 h-0.5 bg-foreground" />
          </button>
        </header>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center p-8"
            >
              <div className="w-full max-w-lg bg-card p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-border flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-muted/20">
                  <motion.div 
                    className="h-full bg-primary shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ type: 'spring', damping: 25, stiffness: 80 }}
                  />
                </div>
                
                <div className="w-24 h-24 bg-muted/30 rounded-[2rem] flex items-center justify-center mb-8 text-primary shadow-inner relative">
                  <div className="absolute inset-0 bg-primary/5 rounded-[2rem] animate-ping" />
                  <Upload size={40} className="relative z-10" />
                </div>
                
                <h3 className="text-3xl font-black text-foreground mb-3 tracking-tight text-center">Analyzing Workspace</h3>
                <p className="text-muted-foreground text-center mb-12 font-medium leading-relaxed max-w-sm">
                  InsightClass AI is identifying learning patterns and synthesizing classroom strategies...
                </p>
                
                <div className="w-full flex justify-between items-center px-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Process Status</span>
                    <span className="text-sm font-black text-foreground/80 uppercase tracking-wider">
                      {uploadProgress < 30 ? 'Parsing Dataset' : 
                       uploadProgress < 60 ? 'Pattern Discovery' : 
                       uploadProgress < 90 ? 'Support Analysis' : 
                       'Finalizing Insights'}
                    </span>
                  </div>
                  <div className="text-4xl font-black text-foreground tracking-tighter">
                    {uploadProgress}%
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !students.length ? (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-full max-w-4xl mx-auto px-10 text-center pt-32 pb-20"
            >
              <div className="w-24 h-24 bg-sidebar text-sidebar-foreground rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-sidebar-border/20 border border-border">
                <GraduationCap size={48} />
              </div>
              <h1 className="text-5xl font-black text-foreground mb-6 tracking-tight">InsightClass</h1>
              <p className="text-muted-foreground text-xl mb-16 leading-relaxed max-w-2xl font-medium">
                The AI-powered classroom decision-support platform. 
                Upload your classroom data to discover learning patterns and receive tailored instructional guidance.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <label className="flex flex-col items-center justify-center p-12 bg-card border-2 border-border rounded-[3rem] hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity text-foreground">
                    <FileText size={120} />
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <span className="text-xl font-black text-foreground mb-2">Initialize Class</span>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Upload CSV Dataset</span>
                  <input type="file" className="hidden" accept=".csv" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                </label>
                
                <button 
                  onClick={loadMockData}
                  className="flex flex-col items-center justify-center p-12 bg-card border-2 border-border rounded-[3rem] hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity text-foreground">
                    <Database size={120} />
                  </div>
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                    <Database size={32} />
                  </div>
                  <span className="text-xl font-black text-foreground mb-2">Demo Workspace</span>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Explore Sample Insights</span>
                </button>
              </div>
              
              <div className="mt-20 p-8 bg-muted/30 rounded-[2rem] border border-border max-w-xl">
                <div className="flex items-center justify-center gap-3 text-muted-foreground mb-3">
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em]">Ethical AI Principles</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
                  "InsightClass handles student data with extreme care. Our insights are designed to empower teachers, emphasizing supportive guidance over rigid metrics."
                </p>
              </div>
            </motion.div>
          ) : selectedStudent ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 md:p-8"
            >
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="mb-6 text-primary hover:opacity-80 flex items-center font-bold text-sm uppercase tracking-widest"
              >
                ← Back to Dashboard
              </button>
              <StudentDetails student={selectedStudent} />
            </motion.div>
          ) : summary ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 md:p-8"
            >
              <Dashboard 
                students={students} 
                summary={summary} 
                onSelectStudent={setSelectedStudentId}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          ) : summaryError ? (
            <div key="error" className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4 text-center max-w-md p-6">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-2">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-foreground">Unable to generate summary</h3>
                <p className="text-muted-foreground">
                  We've processed the student list, but encountered an error while analyzing classroom-level trends. 
                  You can still view individual student insights below.
                </p>
                <button 
                  onClick={async () => {
                    setSummaryError(false);
                    try {
                      const classSummary = await getClassSummary();
                      setSummary(classSummary);
                    } catch (err) {
                      setSummaryError(true);
                    }
                  }}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-colors"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          ) : (
            <div key="loading-insights" className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium">Loading classroom insights...</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;