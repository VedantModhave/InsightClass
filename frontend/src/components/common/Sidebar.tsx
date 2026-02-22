import React from 'react';
import { LayoutDashboard, Users, FileUp, Settings, ChevronLeft, ChevronRight, GraduationCap, Sun, Moon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onUpload: (file: File) => void;
  onLoadMock: () => void;
  hasData: boolean;
  activeView: 'dashboard' | 'student';
  onViewChange: (view: 'dashboard' | 'student') => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onUpload, 
  onLoadMock, 
  hasData,
  activeView,
  onViewChange,
  isDarkMode,
  onToggleTheme
}) => {
  return (
    <aside 
      className={cn(
        "bg-sidebar border-r border-border transition-all duration-500 ease-in-out flex flex-col z-30 relative shadow-[10px_0_30px_rgba(0,0,0,0.02)] overflow-y-auto no-scrollbar",
        "fixed inset-y-0 left-0 lg:relative lg:flex",
        isOpen ? "w-72 translate-x-0" : "w-24 -translate-x-full lg:translate-x-0"
      )}
    >
      <div className="pt-12 pb-8 px-8 flex items-center gap-4 h-auto mb-2 shrink-0">
        <div className="bg-primary p-2.5 rounded-[1rem] text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
          <GraduationCap size={24} />
        </div>
        {isOpen && (
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-sidebar-foreground leading-none">InsightClass</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">Teacher Hub</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
        <NavItem 
          icon={<LayoutDashboard size={22} />} 
          label="Overview" 
          active={activeView === 'dashboard'} 
          isOpen={isOpen}
          onClick={() => onViewChange('dashboard')}
        />
        <NavItem 
          icon={<Users size={22} />} 
          label="Student Roster" 
          active={activeView === 'student'} 
          isOpen={isOpen}
          onClick={() => {}} 
        />
        
        <div className="pt-4 pb-2">
          {isOpen && <p className="px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-3">Actions</p>}
          <label className={cn(
            "flex items-center gap-4 px-6 py-3 rounded-[1.25rem] transition-all cursor-pointer group",
            "text-muted-foreground hover:bg-muted/50 hover:text-primary"
          )}>
            <div className="p-1 bg-muted/30 rounded-lg group-hover:bg-primary/10 transition-colors">
              <FileUp size={20} className="group-hover:scale-110 transition-transform" />
            </div>
            {isOpen && <span className="font-bold text-sm">Upload Dataset</span>}
            <input 
              type="file" 
              className="hidden" 
              accept=".csv" 
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} 
            />
          </label>
          {!hasData && (
            <button 
              onClick={onLoadMock}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-3 rounded-[1.25rem] transition-all text-left group",
                "text-muted-foreground hover:bg-muted/50 hover:text-emerald-500"
              )}
            >
              <div className="p-1 bg-muted/30 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
                <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              </div>
              {isOpen && <span className="font-bold text-sm">Demo Workspace</span>}
            </button>
          )}
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-border bg-muted/20">
        {isOpen && (
          <div className="mb-4 px-2">
            <div className="flex items-center gap-4 p-3 bg-card rounded-[1.25rem] border border-border shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xs shadow-lg shadow-primary/20">
                JD
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-foreground truncate tracking-tight">Jane Doe</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">Senior Educator</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={onToggleTheme}
            className="w-full flex items-center gap-4 px-6 py-3 rounded-[1.25rem] transition-all group relative overflow-hidden text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <div className="transition-transform duration-300 group-hover:scale-110 relative z-10">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            {isOpen && <span className="font-bold text-sm tracking-tight relative z-10">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <button 
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all shadow-sm active:scale-95"
          >
            {isOpen ? <ChevronLeft size={20} strokeWidth={3} /> : <ChevronRight size={20} strokeWidth={3} />}
          </button>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isOpen: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, isOpen, onClick }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-6 py-3 rounded-[1.25rem] transition-all group relative overflow-hidden",
      active 
        ? "text-primary-foreground shadow-xl shadow-primary/20" 
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    )}
  >
    {active && (
      <motion.div 
        layoutId="activeNav"
        className="absolute inset-0 bg-primary rounded-[1.25rem] -z-10"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <div className={cn(
      "transition-transform duration-300 group-hover:scale-110 relative z-10",
      active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
    )}>
      {icon}
    </div>
    {isOpen && <span className="font-bold text-sm tracking-tight relative z-10">{label}</span>}
  </button>
);

export default Sidebar;