import React, { useState } from 'react';
import { StudentInsight, ClassroomSummary, RiskLevel } from '../../types';
import { PATTERNS } from '../../services/analysisService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { AlertCircle, TrendingUp, Users, BrainCircuit, Sparkles, ChevronRight, Search, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import AskInsightClass from './AskInsightClass';

interface DashboardProps {
  students: StudentInsight[];
  summary: ClassroomSummary;
  onSelectStudent: (id: string) => void;
  isDarkMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ students, summary, onSelectStudent, isDarkMode = false }) => {
  const [filters, setFilters] = useState({
    riskStatus: 'All',
    learningPattern: 'All',
    academicTrend: 'All',
    attendanceRange: 'All'
  });

  const riskClasses: Record<RiskLevel, string> = {
    'Stable': 'bg-status-stable-bg text-status-stable-text border-status-stable-border',
    'Needs Attention': 'bg-status-attention-bg text-status-attention-text border-status-attention-border',
    'High Risk': 'bg-status-risk-bg text-status-risk-text border-status-risk-border'
  };

  const riskChartColors: Record<RiskLevel, string> = isDarkMode ? {
    'Stable': '#5EEAD4',
    'Needs Attention': '#FCD34D',
    'High Risk': '#FF7E91'
  } : {
    'Stable': '#14B8A6',
    'Needs Attention': '#F59E0B',
    'High Risk': '#F43F5E'
  };

  const riskDistribution = summary?.overallRiskDistribution || {
    'Stable': 0,
    'Needs Attention': 0,
    'High Risk': 0
  };

  const riskData = Object.entries(riskDistribution).map(([name, value]) => ({
    name, 
    value: Number(value) || 0, 
    color: riskChartColors[name as RiskLevel] || '#94a3b8'
  }));

  const patternData = (summary?.topPatterns || []).map(p => ({
    name: p.name || 'Unknown',
    count: Number(p.count) || 0,
    color: PATTERNS.find(pat => pat.name === p.name)?.color || '#94a3b8'
  }));

  const filteredStudents = students.filter(student => {
    const riskMatch = filters.riskStatus === 'All' || student.riskLevel === filters.riskStatus;
    const patternMatch = filters.learningPattern === 'All' || PATTERNS.find(p => p.id === student.patternId)?.name === filters.learningPattern;
    const academicMatch = filters.academicTrend === 'All' || student.academicTrend === filters.academicTrend;
    
    let attendanceMatch = true;
    if (filters.attendanceRange !== 'All') {
      const rate = student.attendanceRate;
      if (filters.attendanceRange === 'Below 75%') attendanceMatch = rate < 0.75;
      else if (filters.attendanceRange === '75–90%') attendanceMatch = rate >= 0.75 && rate <= 0.90;
      else if (filters.attendanceRange === 'Above 90%') attendanceMatch = rate > 0.90;
    }

    return riskMatch && patternMatch && academicMatch && attendanceMatch;
  });

  return (
    <div className="space-y-10 pb-16 relative">
      {/* Header & AI Summary */}
      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none text-foreground">
          <BrainCircuit size={160} />
        </div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-muted-foreground mb-3 font-bold tracking-widest uppercase text-[10px]">
              <Sparkles size={14} className="text-primary" />
              <span>AI Classroom Insight</span>
            </div>
            <h2 className="text-3xl font-extrabold text-foreground mb-6 tracking-tight">Classroom Overview</h2>
            <div className="space-y-6">
              <p 
                className="text-foreground/80 leading-relaxed text-lg font-medium"
                dangerouslySetInnerHTML={{ 
                  __html: (summary?.aiSummary || 'Analysis in progress...')
                    .replace(/\*\*/g, '')
                    .replace(/\*/g, '')
                    .replace(/_/g, '')
                }}
              />
              {summary?.recentChangesSummary && (
                <div className="bg-muted/30 p-5 rounded-2xl border border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <TrendingUp size={14} className="text-primary" /> Recent Observations
                  </h4>
                  <p 
                    className="text-foreground/90 font-medium"
                    dangerouslySetInnerHTML={{ 
                      __html: summary.recentChangesSummary
                        .replace(/\*\*/g, '')
                        .replace(/\*/g, '')
                        .replace(/_/g, '')
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:flex gap-4 shrink-0 w-full md:w-auto">
            <StatCard icon={<Users size={20} />} label="Total Students" value={(students?.length || 0).toString()} color="purple" />
            <StatCard icon={<AlertCircle size={20} />} label="Priority Support" value={(riskDistribution['High Risk'] || 0).toString()} color="red" />
          </div>
        </div>
        
        <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-border">
          {(summary?.keyTrends || []).map((trend, i) => (
            <span key={i} className="px-4 py-1.5 bg-muted/50 text-muted-foreground rounded-full text-xs font-bold border border-border hover:bg-muted transition-colors cursor-default">
              • {trend}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 7-Day Teaching Plan */}
        <div className="lg:col-span-1 bg-card p-8 rounded-3xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Calendar className="text-emerald-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Recommended Focus</h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Next 7 Days</p>
            </div>
          </div>
          <div className="space-y-4 flex-grow">
            {(summary?.sevenDayTeachingPlan || []).length > 0 ? (
              summary.sevenDayTeachingPlan.map((plan, i) => (
                <div key={i} className="flex gap-4 p-4 bg-muted/20 rounded-2xl border border-border text-sm text-foreground/80 font-medium hover:border-emerald-500/30 transition-colors group">
                  <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                  <span dangerouslySetInnerHTML={{ 
                    __html: plan
                      .replace(/\*\*/g, '')
                      .replace(/\*/g, '')
                      .replace(/_/g, '') 
                  }} />
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                Gathering instructional insights...
              </div>
            )}
          </div>
        </div>

        {/* Learning Patterns Distribution */}
        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BrainCircuit className="text-primary" size={20} />
            </div>
            <h3 className="font-bold text-foreground">Learning Patterns</h3>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patternData} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-border" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={140} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 600 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  cursor={{ fill: 'currentColor', opacity: 0.05 }}
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {patternData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Overview */}
        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <AlertCircle className="text-destructive" size={20} />
            </div>
            <h3 className="font-bold text-foreground">Student Support Summary</h3>
          </div>
          <div className="h-[320px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-8 border-b border-border space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 rounded-xl">
                <Users className="text-muted-foreground" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Student Insights</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Detailed Analytics</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-muted/50 rounded-full border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {filteredStudents.length} Students Listed
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="flex flex-wrap gap-4">
            <FilterSelect 
              label="Support Status" 
              value={filters.riskStatus} 
              options={['All', 'Stable', 'Needs Attention', 'High Risk']}
              onChange={(v) => setFilters(f => ({ ...f, riskStatus: v }))}
            />
            <FilterSelect 
              label="Learning Pattern" 
              value={filters.learningPattern} 
              options={['All', ...PATTERNS.map(p => p.name)]}
              onChange={(v) => setFilters(f => ({ ...f, learningPattern: v }))}
            />
            <FilterSelect 
              label="Academic Trend" 
              value={filters.academicTrend} 
              options={['All', 'Improving', 'Stable', 'Declining']}
              onChange={(v) => setFilters(f => ({ ...f, academicTrend: v }))}
            />
            <FilterSelect 
              label="Attendance" 
              value={filters.attendanceRange} 
              options={['All', 'Below 75%', '75–90%', 'Above 90%']}
              onChange={(v) => setFilters(f => ({ ...f, attendanceRange: v }))}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">
                <th className="px-8 py-5">Roll No</th>
                <th className="px-8 py-5">Status & Pattern</th>
                <th className="px-8 py-5">Academic Performance</th>
                <th className="px-8 py-5">Attendance</th>
                <th className="px-8 py-5">Engagement</th>
                <th className="px-8 py-5">Last Active</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-muted/50 transition-all group cursor-pointer"
                    onClick={() => onSelectStudent(student.id)}
                  >
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono font-bold text-foreground bg-card px-3 py-1.5 rounded-xl border border-border shadow-sm">
                        #{student.rollNumber}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center">
                          <span 
                            className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", riskClasses[student.riskLevel])}
                          >
                            {student.riskLevel}
                          </span>
                        </div>
                        <span 
                          className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                        >
                          {PATTERNS.find(p => p.id === student.patternId)?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <TrendIndicator trend={student.academicTrend} />
                        <span className="text-sm font-bold text-foreground/80">
                          {student.academicScore !== null ? `${Math.round(student.academicScore)}%` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <TrendIndicator trend={student.attendanceTrend === 'Up' ? 'Improving' : student.attendanceTrend === 'Down' ? 'Declining' : 'Stable'} />
                        <span className="text-sm font-bold text-foreground/80">
                          {Math.round(student.attendanceRate * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                        student.engagementLevel === 'High' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        student.engagementLevel === 'Medium' ? "bg-primary/10 text-primary border-primary/20" :
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {student.engagementLevel}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">{student.lastActivity}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center text-muted-foreground/30 mb-6">
                        <Search size={40} />
                      </div>
                      <p className="text-xl font-bold text-foreground mb-2">No results found</p>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
                        We couldn't find any students matching your current filter criteria.
                      </p>
                      <button 
                        onClick={() => setFilters({
                          riskStatus: 'All',
                          learningPattern: 'All',
                          academicTrend: 'All',
                          attendanceRange: 'All'
                        })}
                        className="mt-8 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Floating AI Assistant */}
      <AskInsightClass />
    </div>
  );
};

const FilterSelect: React.FC<{ label: string, value: string, options: string[], onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="flex flex-col gap-1.5 min-w-[140px]">
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] ml-1">{label}</span>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-card border border-border rounded-xl px-4 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const TrendIndicator: React.FC<{ trend: 'Improving' | 'Stable' | 'Declining' }> = ({ trend }) => {
  if (trend === 'Improving') return (
    <div className="flex items-center gap-1 text-emerald-500">
      <ArrowUpRight size={14} strokeWidth={3} />
    </div>
  );
  if (trend === 'Declining') return (
    <div className="flex items-center gap-1 text-destructive">
      <ArrowDownRight size={14} strokeWidth={3} />
    </div>
  );
  return (
    <div className="flex items-center gap-1 text-muted-foreground/30">
      <Minus size={14} strokeWidth={3} />
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: 'purple' | 'red' | 'emerald' }> = ({ icon, label, value, color }) => {
  const colorMap = {
    purple: 'bg-primary/10 text-primary border-primary/20',
    red: 'bg-destructive/10 text-destructive border-destructive/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };
  
  return (
    <div className={cn("p-6 rounded-3xl border flex flex-col items-start min-w-[140px] shadow-sm", colorMap[color])}>
      <div className="mb-4 p-2 bg-card/80 rounded-xl">{icon}</div>
      <div className="text-3xl font-black leading-none mb-1 tracking-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-wider font-extrabold opacity-60 leading-tight">{label}</div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default Dashboard;