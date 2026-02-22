import React from 'react';
import { StudentInsight } from '../../types';
import { PATTERNS, STRATEGIES } from '../../services/analysisService';
import { 
  CheckCircle2, AlertTriangle, Lightbulb, Target, BrainCircuit, 
  BarChart3, Calendar, MessageSquare, TrendingDown, TrendingUp, Sparkles,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

interface StudentDetailsProps {
  student: StudentInsight;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ student }) => {
  const pattern = PATTERNS.find(p => p.id === student.patternId)!;
  
  // Use dynamic strategies from backend if available, fallback to static if not
  const strategies = student.instructionalStrategies || STRATEGIES[student.patternId];
  const strategyExplanation = student.strategyExplanation || `These recommendations are tailored to the ${pattern.name} pattern observed in student #${student.rollNumber}'s recent engagement metrics.`;

  // Helper to check if a reason is a reassuring message
  const isReassuring = (reason: string) => {
    return reason.includes("No immediate concerns") || 
           reason.includes("suggest this student is on track") || 
           reason.includes("No urgent action required");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Profile Header */}
      <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm flex flex-col md:flex-row gap-10 items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-foreground">
          <BrainCircuit size={200} />
        </div>
        
        <div 
          className="w-28 h-28 rounded-3xl flex items-center justify-center shrink-0 shadow-inner relative z-10"
          style={{ backgroundColor: pattern.color + '15', color: pattern.color }}
        >
          <BrainCircuit size={56} />
        </div>
        
        <div className="flex-1 relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h1 className="text-4xl font-black text-foreground tracking-tight">Student #{student.rollNumber}</h1>
            <div className="flex items-center gap-2">
              <span 
                className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                style={{ backgroundColor: pattern.color + '10', color: pattern.color, borderColor: pattern.color + '20' }}
              >
                {pattern.name}
              </span>
              <RiskBadge level={student.riskLevel} />
            </div>
          </div>
          
          <div className="bg-muted/30 border border-border p-5 rounded-2xl mb-8 max-w-2xl">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <Sparkles size={14} /> AI-Generated Insight
            </h4>
            <p className="text-foreground/80 font-medium leading-relaxed">
              {student.recentChangeInsight}
            </p>
          </div>

          <p className="text-muted-foreground text-lg mb-10 max-w-3xl leading-relaxed font-medium">
            {pattern.description}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <MetricItem 
              label="Academic Performance" 
              value={student.academicScore !== null ? `${Math.round(student.academicScore)}%` : 'Insufficient Data'} 
              icon={<BarChart3 size={18} />} 
              trend={student.academicScore !== null ? student.scoreTrend : undefined} 
              tooltip="Based on historical performance and recent assessment results."
            />
            <MetricItem label="Attendance" value={`${Math.round(student.attendanceRate * 100)}%`} icon={<Calendar size={18} />} />
            <MetricItem label="Participation" value={`${Math.round(student.participationRate * 100)}%`} icon={<MessageSquare size={18} />} />
            <MetricMetric label="Recent Activity" value={student.lastSubmissionDaysAgo === 0 ? 'Today' : `${student.lastSubmissionDaysAgo} days ago`} />
          </div>

          {(student.previousScores !== undefined || student.examScore !== undefined) && (
            <div className="mt-10 pt-10 border-t border-border flex gap-12">
              {student.previousScores !== undefined && (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Historical Average</span>
                  <span className="text-lg font-black text-foreground/80">{student.previousScores}%</span>
                </div>
              )}
              {student.examScore !== undefined && (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Recent Exam</span>
                  <span className="text-lg font-black text-foreground/80">{student.examScore}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Why this pattern? */}
          <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-amber-500/10 rounded-2xl">
                <Lightbulb className="text-amber-500" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Pattern Understanding</h3>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed text-lg font-medium">
              Student #{student.rollNumber}'s recent engagement aligns with the <b className="text-foreground">{pattern.name}</b> profile. 
              Our analysis identifies these key contributing factors:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.topContributingFactors.map((factor, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-muted/20 rounded-[1.5rem] border border-border group hover:border-primary/30 transition-all">
                  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                  </div>
                  <span className="text-foreground/80 font-bold text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Fairness & Stability */}
          {student.riskLevel === 'Stable' && student.fairnessExplanation && (
            <section className="bg-status-stable-bg/30 p-10 rounded-[2.5rem] border border-status-stable-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-status-stable-bg rounded-2xl">
                  <CheckCircle2 className="text-status-stable-text" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-status-stable-text">Support Stability</h3>
              </div>
              <p 
                className="text-status-stable-text leading-relaxed font-semibold text-lg"
                dangerouslySetInnerHTML={{ 
                  __html: student.fairnessExplanation
                    .replace(/\*\*/g, '')
                    .replace(/\*/g, '')
                    .replace(/_/g, '')
                }}
              />
              <div className="mt-6 flex items-center gap-2 text-[11px] text-status-stable-text/70 font-bold uppercase tracking-widest italic">
                <Sparkles size={12} /> InsightClass monitoring protective factors
              </div>
            </section>
          )}

          {/* Actionable Focus Areas */}
          <section className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-primary/10 rounded-2xl">
                <Target className="text-primary" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Targeted Observations</h3>
            </div>
            <div className="space-y-4">
              {student.riskReasons.map((reason, i) => {
                const reassuring = isReassuring(reason);
                return (
                  <div key={i} className={`flex gap-5 p-6 rounded-[1.75rem] border transition-all ${reassuring ? 'bg-status-stable-bg/20 border-status-stable-border/30' : 'bg-status-risk-bg/20 border-status-risk-border/30'}`}>
                    <div className="shrink-0 mt-1">
                      {reassuring ? (
                        <div className="w-10 h-10 rounded-2xl bg-card flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="text-status-stable-text" size={22} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-card flex items-center justify-center shadow-sm">
                          <AlertTriangle className="text-status-risk-text" size={22} />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className={`${reassuring ? 'text-status-stable-text' : 'text-status-risk-text'} text-[10px] font-black uppercase tracking-[0.2em] block mb-2 opacity-70`}>
                        {reassuring ? 'Status Check' : 'Support Priority'}
                      </span>
                      <p 
                        className={`${reassuring ? 'text-status-stable-text' : 'text-status-risk-text'} font-bold text-lg leading-tight`}
                        dangerouslySetInnerHTML={{ 
                          __html: reason
                            .replace(/\*\*/g, '')
                            .replace(/\*/g, '')
                            .replace(/_/g, '')
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Strategy Recommendations */}
        <div className="space-y-8">
          <section className="bg-sidebar p-10 rounded-[3rem] text-sidebar-foreground shadow-2xl shadow-sidebar-border/20">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2.5 bg-primary/20 rounded-2xl">
                <Sparkles className="text-primary" size={24} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Support Strategies</h3>
            </div>
            
            <div className="space-y-10">
              <StrategyGroup title="Classroom Environment" items={strategies.adjustments} />
              <StrategyGroup title="Engagement Tactics" items={strategies.engagementTechniques} />
              <StrategyGroup title="Assessment Strategy" items={strategies.assessmentApproach || strategies.assessmentChanges} />
            </div>
            
            <div className="mt-12 pt-10 border-t border-border/10">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Lightbulb size={16} className="text-primary" />
                </div>
                <p 
                  className="text-muted-foreground text-xs font-medium leading-relaxed italic"
                  dangerouslySetInnerHTML={{ 
                    __html: strategyExplanation
                      .replace(/\*\*/g, '')
                      .replace(/\*/g, '')
                      .replace(/_/g, '')
                  }}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const RiskBadge: React.FC<{ level: string }> = ({ level }) => {
  const styles: Record<string, string> = {
    'Stable': 'bg-status-stable-bg text-status-stable-text border-status-stable-border',
    'Needs Attention': 'bg-status-attention-bg text-status-attention-text border-status-attention-border',
    'High Risk': 'bg-status-risk-bg text-status-risk-text border-status-risk-border'
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[level] || styles.Stable}`}>
      {level}
    </span>
  );
};

const MetricItem: React.FC<{ label: string, value: string, icon: React.ReactNode, trend?: number, tooltip?: string }> = ({ label, value, icon, trend, tooltip }) => (
  <div className="relative group/metric">
    <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
      <div className="p-1 bg-muted/30 rounded-lg group-hover/metric:bg-primary/10 transition-colors">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {tooltip && <div className="w-1 h-1 rounded-full bg-border" />}
    </div>
    <div className="flex items-center gap-3">
      <span className={`text-2xl font-black tracking-tight ${value === 'Insufficient Data' ? 'text-muted-foreground text-sm italic' : 'text-foreground/90'}`}>{value}</span>
      {trend !== undefined && trend !== 0 && (
        <div className={`p-1 rounded-lg ${trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
          {trend > 0 ? <ArrowUpRight size={16} strokeWidth={3} /> : <ArrowDownRight size={16} strokeWidth={3} />}
        </div>
      )}
    </div>
    {tooltip && (
      <div className="absolute bottom-full left-0 mb-3 w-56 p-4 bg-sidebar text-sidebar-foreground text-[10px] rounded-2xl shadow-2xl border border-border opacity-0 group-hover/metric:opacity-100 transition-all pointer-events-none z-50 normal-case font-bold leading-relaxed">
        {tooltip}
      </div>
    )}
  </div>
);

const MetricMetric: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
      <div className="p-1 bg-muted/30 rounded-lg"><Calendar size={18} /></div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-2xl font-black text-foreground/90 tracking-tight">{value}</div>
  </div>
);

const StrategyGroup: React.FC<{ title: string, items: string[] }> = ({ title, items }) => (
  <div>
    <h4 className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.25em] mb-5">{title}</h4>
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-4 items-start group/item">
          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.5)] group-hover/item:scale-150 transition-transform" />
          <span 
            className="text-[15px] font-bold leading-relaxed text-sidebar-foreground/80 group-hover/item:text-sidebar-foreground transition-colors"
            dangerouslySetInnerHTML={{ 
              __html: item
                .replace(/\*\*/g, '')
                .replace(/\*\*/g, '')
                .replace(/_/g, '')
            }}
          />
        </li>
      ))}
    </ul>
  </div>
);

export default StudentDetails;