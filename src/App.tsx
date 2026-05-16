/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Treemap
} from 'recharts';
import { 
  TrendingUp, 
  Plus, 
  Minus, 
  Brain, 
  Briefcase, 
  User, 
  ChevronRight, 
  ChevronLeft,
  X,
  Check,
  Info,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Download,
  Trash2,
  Send,
  CreditCard,
  Target,
  Shield,
  Clock,
  ArrowLeftRight,
  Activity,
  ShieldCheck,
  Globe,
  Zap,
  History,
  Lock,
  LayoutDashboard,
  Edit3,
  ArrowDownCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Database,
  Cpu,
  PenTool,
  ArrowUpRight
} from 'lucide-react';
import Markdown from 'react-markdown';
import { getFinancialAdvice, FinancialContext } from './services/geminiService';
import { auth, db } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  Archetype, 
  Tab, 
  FinancialItem, 
  DebtItem, 
  SavingsGoal, 
  UserProfile, 
  VentureItem, 
  UserData 
} from './types';
import { 
  safeGet, 
  safeSet, 
  safeRemove, 
  getUsers, 
  saveUsers, 
  getSession, 
  setSession, 
  clearSession, 
  hashPassword,
  createDefaultData 
} from './lib/storage';
import { COLORS, TREND_DATA, OperationType } from './constants';
import SovereignGate from './components/SovereignGate';
import SplashLoader from './components/SplashLoader';
import VaultDecrypting from './components/VaultDecrypting';
import ExecutiveDashboardWrapper from './components/ExecutiveDashboardWrapper';

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, isMobile: window.innerWidth < 1024 });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, isMobile: window.innerWidth < 1024 });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

// --- Components ---

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const handlePointer = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setHovering(!!target.closest('button, a, input, select, .interactive'));
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handlePointer);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handlePointer);
    };
  }, []);

  return (
    <div 
      className={`custom-cursor hidden sm:block ${hovering ? 'hovering' : ''}`}
      style={{ left: pos.x, top: pos.y }}
    />
  );
};

const Logo = ({ variant = 'full' }: { variant?: 'full' | 'mark' | 'stacked' }) => {
  const Mark = (
    <div className="relative group interactive">
      <div className="absolute inset-0 bg-[#D4AF37]/10 blur-[12px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-10 h-10 border border-[#D4AF37] rotate-45 flex items-center justify-center relative transition-all duration-700 group-hover:rotate-[225deg]">
        <div className="-rotate-45 font-serif text-[#D4AF37] text-lg font-black select-none">W</div>
      </div>
    </div>
  );

  const Wordmark = (
    <div className="flex items-center gap-0.5">
      <span className="heading text-[18px] font-semibold tracking-[0.1em] text-[#E5E4E2]">WEALTH</span>
      <span className="heading text-[18px] font-light tracking-[0.1em] text-[#E5E4E2] opacity-50">PRO</span>
    </div>
  );

  if (variant === 'mark') return Mark;
  if (variant === 'stacked') return (
    <div className="flex flex-col items-center gap-4">
      {Mark}
      {Wordmark}
    </div>
  );

  return (
    <div className="flex items-center gap-[12px]">
      {Mark}
      {Wordmark}
    </div>
  );
};

const WealthSphere = ({ score }: { score: number }) => {
  return (
    <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.6, 1, 0.6],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full border border-[#D4AF37]/20 bg-radial-[at_center] from-[#D4AF37]/10 via-transparent to-transparent flex items-center justify-center"
      >
        <div className="w-[85%] h-[85%] rounded-full border border-[#D4AF37]/10 flex items-center justify-center">
          <div className="w-[70%] h-[70%] rounded-full border border-[#D4AF37]/5" />
        </div>
      </motion.div>
      
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold mb-1">Neural Health</span>
        <span className="heading text-5xl font-bold text-[#D4AF37] mono">{score}</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] opacity-60 font-bold mt-2 italic">Platinum Tier</span>
      </div>

      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-[1px] border-dashed border-[#D4AF37]/10 rounded-full"
      />
    </div>
  );
};

const MeshBg = () => (
  <div className="fixed inset-0 -z-50 overflow-hidden bg-[#060709] pointer-events-none">
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/v3.0/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.3, 0.2],
        x: [0, 100, 0],
        y: [0, -50, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#D4AF37]/5 blur-[150px] translate-x-1/4 -translate-y-1/4 rounded-full" 
    />
    <motion.div 
      animate={{ 
        scale: [1.2, 1, 1.2],
        opacity: [0.1, 0.2, 0.1],
        x: [0, -80, 0],
        y: [0, 40, 0]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-blue/3 blur-[180px] -translate-x-1/3 translate-y-1/3 rounded-full" 
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060709]/80 to-[#060709]" />
  </div>
);

const SyncProgress = ({ label = "Syncing Data..." }: { label?: string }) => (
  <div className="fixed inset-0 z-[1000] bg-[#060709] flex flex-col items-center justify-center p-8">
    <MeshBg />
    <div className="relative mb-12">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="w-32 h-32 rounded-full border border-goldMid/10 border-t-goldMid/60 border-l-goldMid/30"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 border border-[#D4AF37] rotate-45 flex items-center justify-center">
          <div className="-rotate-45 font-serif text-[#D4AF37] text-xl font-black">W</div>
        </div>
      </div>
    </div>
    <div className="space-y-4 text-center max-w-xs">
      <h3 className="heading text-platinum text-lg font-semibold tracking-tight">{label}</h3>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-2/3 gold-gradient"
        />
      </div>
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-muted opacity-40">Securing Financial Nodes • v4.2</p>
    </div>
  </div>
);

const Tilt3D = ({ children, intensity = 12 }: { children: React.ReactNode, intensity?: number, key?: any }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;

    setStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.3, 1)',
      boxShadow: `0 40px 80px rgba(0,0,0,0.6)`
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.3, 1)'
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transformStyle: 'preserve-3d' }}
      className="h-full cursor-none"
    >
      {children}
    </div>
  );
};

const GlassCard = ({ children, className = "", glow = false, tier = 2, accent = false, style = {}, shimmer = false }: { children: React.ReactNode, className?: string, glow?: boolean, tier?: 1 | 2 | 3, accent?: boolean, key?: any, style?: React.CSSProperties, shimmer?: boolean }) => {
  const tierClass = tier === 1 ? 'glass-tier-1' : tier === 3 ? 'glass-tier-3' : 'glass-tier-2';
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!shimmer || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      style={style}
      className={`rounded-2xl p-6 relative overflow-hidden transition-all duration-500 ${tierClass} ${className} ${accent ? 'border-[#D4AF37]/30' : ''}`}
    >
      {shimmer && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(212,175,55,0.06) 0%, transparent 70%)`
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const CapitalCallOverlay = ({ isOpen, onClose, ventureName, onComplete }: { isOpen: boolean; onClose: () => void; ventureName: string; onComplete: () => void }) => {
  const [signed, setSigned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (signed) {
      const timer = setTimeout(() => {
        setIsProcessing(true);
        setTimeout(() => {
          onComplete();
          setIsProcessing(false);
          setSigned(false);
        }, 3000);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [signed, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#060709]/95 backdrop-blur-3xl"
        >
          <div className="max-w-xl w-full">
            <GlassCard tier={3} className="p-12 border-[#D4AF37]/20 shadow-[0_0_100px_rgba(212,175,55,0.1)] relative">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-text-muted hover:text-platinum transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-12">
                <div className="w-20 h-20 rounded-3xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mx-auto mb-6 border border-[#D4AF37]/20">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h2 className="heading text-3xl font-serif italic text-platinum mb-3">Authorize Capital</h2>
                <p className="text-[11px] uppercase tracking-[0.4em] text-goldMid font-bold opacity-60">Legal Electronic Execution Framework</p>
              </div>

              <div className="space-y-8 mb-12">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Target Initiative</span>
                    <span className="text-sm font-semibold text-platinum font-serif italic">{ventureName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Deployment Sum</span>
                    <span className="mono text-xl font-bold text-goldMid">$250,000.00</span>
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold text-center">Digital Signature Required to Deploy</p>
                   <div 
                     onClick={() => !isProcessing && setSigned(true)}
                     className={`h-40 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-crosshair transition-all overflow-hidden relative group ${signed ? 'border-green bg-green/5' : 'border-white/10 hover:border-goldMid/50 hover:bg-white/[0.01]'}`}
                   >
                     {isProcessing ? (
                       <div className="flex flex-col items-center gap-3">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-8 h-8 rounded-full border-2 border-goldMid border-t-transparent" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-goldMid animate-pulse">Neural Validation...</span>
                       </div>
                     ) : signed ? (
                       <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2">
                          <Check className="w-10 h-10 text-green" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-green">Authorization Authenticated</span>
                       </motion.div>
                     ) : (
                       <>
                         <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         <PenTool className="w-8 h-8 text-text-muted mb-2 opacity-40 group-hover:text-goldMid transition-all" />
                         <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Sign Here to Deploy Assets</span>
                       </>
                     )}
                   </div>
                </div>
              </div>

              <div className="text-[9px] uppercase tracking-widest text-text-muted text-center leading-relaxed">
                By authorizing this call, you verify compliance with the Sovereign Wealth Protocol and initiate immediate atomic transfer of operational capital.
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatCard = ({ label, value, color, note }: { label: string; value: string; color: string; note?: string }) => (
  <GlassCard 
    tier={2} 
    shimmer
    className="p-6 relative overflow-hidden group interactive border-l-4" 
    style={{ borderLeftColor: color }}
  >
    <div className="relative z-10">
      <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-bold mb-2 group-hover:text-platinum transition-colors">{label}</p>
      <p className="mono text-3xl font-bold text-platinum tracking-tighter drop-shadow-lg" style={{ textShadow: `0 10px 40px ${color}30` }}>
        {value}
      </p>
      {note && (
        <p className="text-[9px] uppercase tracking-widest text-text-muted mt-3 font-bold opacity-40 group-hover:opacity-100 transition-opacity">
          {note}
        </p>
      )}
    </div>
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/[0.02] to-transparent -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
  </GlassCard>
);

const VentureCard = ({ venture, onCommit }: { venture: VentureItem; onCommit: () => void; key?: string }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="relative min-w-[320px] h-[400px] flex flex-col group overflow-hidden rounded-[32px] border border-white/5 bg-[#14171d] shadow-2xl transition-all hover:border-[#D4AF37]/30 interactive"
    >
      {/* Shimmer Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(212,175,55,0.08) 0%, transparent 60%)`
        }}
      />

      <div className="p-8 flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold opacity-60 mb-1 block">
              {venture.category}
            </span>
            <h3 className="heading text-xl font-semibold text-platinum leading-tight">
              {venture.name}
            </h3>
          </div>
          <div className="px-3 py-1 rounded-full border border-white/10 text-[9px] uppercase tracking-widest font-bold text-text-muted">
            {venture.stage >=1 ? 'Closed' : venture.stage > 0.5 ? 'Due Diligence' : 'Term Sheet'}
          </div>
        </div>

        <div className="mt-auto space-y-6">
          <div>
             <div className="flex justify-between items-end mb-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-bold">Acquisition Stage</span>
                <span className="mono text-[11px] text-platinum">{(venture.stage * 100).toFixed(0)}%</span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${venture.stage * 100}%` }}
                  className="h-full gold-gradient shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                />
             </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-bold mb-1">Equity Stake</span>
            <span className="mono text-4xl font-bold text-platinum tracking-tighter">
              {venture.equityStake.toFixed(2)}<span className="text-[#D4AF37] text-xl ml-1">%</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.04]">
            {[
              { label: 'TVPI', value: venture.tvpi, tooltip: 'Total Value to Paid-In: The ratio of total value (realized + unrealized) to the total capital invested.' },
              { label: 'IRR', value: `${venture.irr}%`, tooltip: 'Internal Rate of Return: The annualized effective compounded return rate.' },
              { label: 'MOIC', value: `x${venture.moic}`, tooltip: 'Multiple of Invested Capital: A measure of investment performance relative to initial capital.' }
            ].map((metric) => (
              <div key={metric.label} className="group/tip relative flex flex-col">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold">{metric.label}</span>
                  <Info className="w-2.5 h-2.5 text-text-muted opacity-40" />
                </div>
                <span className="mono text-xs font-bold text-platinum">{metric.value}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-3 w-40 p-3 glass-tier-3 rounded-xl border border-white/10 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-all scale-95 group-hover/tip:scale-100 z-[100] shadow-2xl">
                  <p className="subheading text-[9px] italic text-platinum/80 leading-relaxed">
                    {metric.tooltip}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={onCommit}
            className="w-full py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-[10px] uppercase tracking-[0.3em] font-bold text-platinum hover:bg-goldMid hover:text-black hover:border-goldMid transition-all mt-4"
          >
            Commit Capital
          </button>
        </div>
      </div>
    </div>
  );
};

const SPRING_CONFIG: any = { type: "spring", stiffness: 100, damping: 20, mass: 1 };

export default function App() {
  const { isMobile } = useWindowSize();
  // 1. Core state — always defined
  const [screen, setScreen] = useState<'loading' | 'auth' | 'onboarding' | 'app'>('loading');
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Overview);
  const [toasts, setToasts] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0); // 0-based as per snippet
  const [highPerfMode, setHighPerfMode] = useState(true);

  useEffect(() => {
    // Initial boot sequence
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (highPerfMode) {
      document.body.classList.remove('high-perf-off');
    } else {
      document.body.classList.add('high-perf-off');
    }
  }, [highPerfMode]);

  const [onboardData, setOnboardData] = useState({
    name: '',
    currency: 'USD',
    sym: '$',
    mode: 'Single' as const,
    goal: 'Save Money',
    archetype: Archetype.Builder,
    income: '',
    savings: '',
    debt: '',
    partnerName: '',
    businessName: ''
  });

  const [isCapitalCallOpen, setIsCapitalCallOpen] = useState(false);
  const [selectedVentureForCall, setSelectedVentureForCall] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<Tab | string | null>(null);
  const [modalForm, setModalForm] = useState({ 
    name: '', 
    amount: '', 
    category: '', 
    type: 'personal' as const, 
    isTaxDeductible: false, 
    balance: '', 
    rate: '', 
    target: '', 
    deadline: '' 
  });

  // Auth States
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");

  // Defensive Hydration
  const defensiveHydrate = useCallback((data: any): UserData => {
    if (!data) return createDefaultData();

    // Legacy Migration Logic: Map old 'savings' data to new 'ventures' structure
    let migratedVentures = Array.isArray(data.ventures) ? data.ventures : [];
    if (migratedVentures.length === 0 && data.savings && typeof data.savings === 'number') {
      migratedVentures = [{
        id: 'legacy_mig_' + Date.now(),
        name: "Legacy Alpha Migration",
        category: "Treasury",
        stage: 1,
        equityStake: 100,
        invested: data.savings,
        currentValue: data.savings * 1.082,
        tvpi: 1.08,
        irr: 8.2,
        moic: 1.08
      }];
    }

    return {
      income: Array.isArray(data.income) ? data.income : [],
      expenses: Array.isArray(data.expenses) ? data.expenses : [],
      debts: Array.isArray(data.debts) ? data.debts : [],
      ventures: migratedVentures,
      budgets: Array.isArray(data.budgets) ? data.budgets : [],
      assets: Array.isArray(data.assets) ? data.assets : [],
      invoices: Array.isArray(data.invoices) ? data.invoices : [],
      clients: Array.isArray(data.clients) ? data.clients : [],
      chatHistory: Array.isArray(data.chatHistory) ? data.chatHistory : [],
      profile: {
        name: data.profile?.name || '',
        email: data.profile?.email || '',
        currency: data.profile?.currency || "USD",
        sym: data.profile?.sym || "$",
        mode: data.profile?.mode || "Single",
        goal: data.profile?.goal || '',
        archetype: data.profile?.archetype || Archetype.Builder,
        taxRate: data.profile?.taxRate || 20,
        onboarded: !!data.profile?.onboarded,
        partnerName: data.profile?.partnerName,
        businessName: data.profile?.businessName
      }
    };
  }, []);

  // 4. Update — saves data + updates state
  const update = useCallback((fn: (prev: UserData) => UserData) => {
    setUserData(prev => {
      try {
        const next = fn(prev || createDefaultData());
        
        // Optimistic local update
        safeSet('wo_user_data', next);
        
        const users = getUsers();
        if (currentEmail && users[currentEmail]) {
          users[currentEmail] = { ...users[currentEmail], data: next };
          saveUsers(users);
        }

        // Trigger Firestore Sync (handled in a separate effect or manually)
        return next;
      } catch(e) {
        console.error('Update error:', e);
        return prev;
      }
    });
  }, [currentEmail]);

  // Sync to Firestore when userData changes (debounced or explicit)
  useEffect(() => {
    if (!userData || !user || isGuest) return;
    
    const timer = setTimeout(async () => {
      const path = `profiles/${user.uid}`;
      try {
        await setDoc(doc(db, path), { ...userData, updatedAt: new Date().toISOString() });
      } catch (error) {
        console.error('Firestore Sync Error:', error);
      }
    }, 2000); // 2s debounce for cloud sync

    return () => clearTimeout(timer);
  }, [userData, user, isGuest]);

  const showToast = useCallback((msg: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-2), { id, msg, type }]); // Max 3 toasts
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeItem = (key: 'income' | 'expenses' | 'debts' | 'ventures', id: string) => {
    update(prev => {
      const next = { ...prev };
      (next[key] as any[]) = (next[key] as any[]).filter((item: any) => item.id !== id);
      return next;
    });
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} decommissioned`, "info");
  };

  useEffect(() => {
    // Initial boot sequence
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        const session = getSession();
        
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          setUser(fbUser);
          
          if (fbUser) {
            const email = fbUser.email || '';
            setCurrentEmail(email);
            setSession(email);
            
            // Try local first for speed
            const users = getUsers();
            const localUser = users[email];
            if (localUser?.data) {
              setUserData(defensiveHydrate(localUser.data));
            }

            // Always fetch fresh from cloud
            const path = `profiles/${fbUser.uid}`;
            try {
              const docSnap = await getDoc(doc(db, path));
              if (docSnap.exists()) {
                const cloudData = defensiveHydrate(docSnap.data());
                setUserData(cloudData);
                safeSet('wo_user_data', cloudData);
                
                // Update local index cache
                users[email] = { ...users[email], data: cloudData, uid: fbUser.uid };
                saveUsers(users);
                
                setScreen(cloudData.profile.onboarded ? 'app' : 'onboarding');
              } else {
                setScreen('onboarding');
              }
            } catch (error) {
              console.error('Cloud init error:', error);
              setScreen('app'); // Fallback to app if we have local data
            }
          } else if (session) {
            // Check if we were in guest mode or if auth is just taking time
            const users = getUsers();
            const localUser = users[session];
            if (localUser?.isGuest) {
              setIsGuest(true);
              setCurrentEmail(session);
              setUserData(defensiveHydrate(localUser.data));
              setScreen('app');
            } else {
              setScreen('auth');
            }
          } else {
            setScreen('auth');
          }
        });

        return () => unsubscribe();
      } catch(e) {
        console.error('Init error:', e);
        clearSession();
        setScreen('auth');
      }
    };
    
    initApp();
  }, [defensiveHydrate]);

  // --- Handlers ---

  const handleLogout = async () => {
    await signOut(auth);
    clearSession();
    setCurrentEmail(null);
    setUserData(null);
    setIsGuest(false);
    safeRemove('wo_user_data');
    setScreen('auth');
    showToast("Session de-authenticated", "info");
  };

  // --- Computed Data ---
  const stats = useMemo(() => {
    if (!userData) return { totalIncome: 0, totalExpenses: 0, netFlow: 0, debt: 0, savingsRate: 0, score: 0, netWorth: 0 };
    
    // Safety guards with Number() casts to prevent runtime crashes
    const totalIncome = (userData.income || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalExpenses = (userData.expenses || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const netFlow = totalIncome - totalExpenses;
    const totalDebt = (userData.debts || []).reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);
    const totalAssets = (userData.ventures || []).reduce((acc, curr) => acc + (Number(curr.currentValue) || 0), 0);
    const totalInvested = (userData.ventures || []).reduce((acc, curr) => acc + (Number(curr.invested) || 0), 0);
    
    const savingsRate = totalIncome > 0 ? Math.round(( (totalIncome - totalExpenses) / totalIncome) * 100) : 0;
    const netWorth = totalAssets - totalDebt;
    
    // Score Calculation
    let score = 0;
    if (netFlow > 0) score += 25;
    if (savingsRate > 15) score += 20; else if (savingsRate > 0) score += 10;
    if (totalDebt === 0) score += 25; else if (totalDebt < (totalIncome * 6)) score += 15; else score += 5;
    if (totalIncome > 0) score += 10; // Active income
    if (totalAssets > (totalExpenses * 3)) score += 20; else if (totalAssets > totalExpenses) score += 10;

    return { 
      totalIncome, 
      totalExpenses, 
      netFlow, 
      debt: totalDebt, 
      savingsRate: Math.max(0, savingsRate), 
      score: Math.min(100, Math.max(0, score)),
      netWorth
    };
  }, [userData]);

  // --- Render Helpers ---




  const finishOnboarding = async () => {
    try {
      const newData = createDefaultData();
      
      // Set profile
      newData.profile = {
        ...newData.profile,
        name: onboardData.name || user?.displayName || 'Strategist',
        email: currentEmail || '',
        currency: onboardData.currency,
        sym: onboardData.sym,
        mode: onboardData.mode as any,
        goal: onboardData.goal,
        archetype: onboardData.archetype,
        partnerName: onboardData.partnerName || '',
        businessName: onboardData.businessName || '',
        onboarded: true
      };
      
      // Add starting data if provided (Simplified mapping)
      if (onboardData.income && +onboardData.income > 0) {
        newData.income.push({
          id: 'inc_initial',
          name: 'Primary Ingress',
          amount: +onboardData.income,
          category: 'Income',
          type: (onboardData.mode as string) === 'Business' ? 'business' : 'personal',
          date: new Date().toISOString()
        });
      }
      
      setUserData(newData);
      
      // Save to local index
      if (currentEmail) {
        const users = getUsers();
        if (users[currentEmail]) {
          users[currentEmail] = { ...users[currentEmail], data: newData };
          saveUsers(users);
        }
      }

      // Save to Firebase
      if (user) {
        const path = `profiles/${user.uid}`;
        await setDoc(doc(db, path), newData);
      }

      setScreen('app');
      setActiveTab(Tab.Overview);
      showToast("System Onboarded. Welcome, Strategist.", "success");
    } catch(e) {
      console.error('Onboarding error:', e);
      setScreen('app');
    }
  };

  const renderOnboarding = () => (
    <div className="min-h-screen relative p-6 flex flex-col items-center pt-24 overflow-hidden">
      <div className="w-full max-w-[440px] animate-fade-up relative z-10">
        <div className="flex gap-2 mb-12">
          {[0,1,2,3,4].map(s => (
            <div key={s} className="h-1 flex-1 rounded-full bg-white/5 relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: s <= onboardingStep ? '100%' : '0%' }}
                className="absolute inset-0 gold-gradient"
              />
            </div>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          {onboardingStep === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard tier={3} className="p-8">
                <h3 className="heading text-3xl mb-3 font-semibold text-platinum tracking-tight">Identity Check</h3>
                <p className="text-text-secondary text-sm mb-8 leading-relaxed">Confirm your preferred callsign for fiscal communications.</p>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.1em] text-goldMid font-bold mb-2 block">Operator Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-platinum focus:border-goldMid outline-none transition-all placeholder:opacity-20"
                      placeholder="e.g. Sterling Archer"
                      value={onboardData.name || authForm.name}
                      onChange={e => setOnboardData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>
                <button onClick={() => setOnboardingStep(1)} className="w-full gold-gradient py-5 rounded-2xl font-bold mt-8 text-black uppercase tracking-widest text-xs">Verify Identity</button>
              </GlassCard>
            </motion.div>
          )}

          {onboardingStep === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard tier={3} className="p-8">
                <h3 className="heading text-3xl mb-3 font-semibold text-platinum tracking-tight">Financial Mode</h3>
                <p className="text-text-secondary text-sm mb-8 leading-relaxed">Select the primary structural lens for your wealth engine.</p>
                <div className="space-y-3">
                  {['Single', 'Couples', 'Business'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setOnboardData(prev => ({ ...prev, mode: m as any }))}
                      className={`w-full p-6 rounded-2xl border text-left transition-all group ${onboardData.mode === m ? 'bg-goldMid/10 border-goldMid text-goldLight' : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold tracking-tight">{m} Unit</span>
                        {onboardData.mode === m && <ShieldCheck className="w-5 h-5 text-goldMid" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setOnboardingStep(0)} className="flex-1 py-5 rounded-2xl font-bold text-text-muted border border-white/5 uppercase tracking-widest text-xs">Back</button>
                  <button onClick={() => setOnboardingStep(2)} className="flex-[2] gold-gradient py-5 rounded-2xl font-bold text-black uppercase tracking-widest text-xs">Set Framework</button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {onboardingStep === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard tier={3} className="p-8">
                <h3 className="heading text-3xl mb-3 font-semibold text-platinum tracking-tight">Strategic Archetype</h3>
                <p className="text-text-secondary text-sm mb-8 leading-relaxed">Choose the risk-reward binary that governs your decision matrix.</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: Archetype.Builder, desc: 'Aggressive Alpha', icon: <TrendingUp className="w-5 h-5" /> },
                    { id: Archetype.Optimizer, desc: 'Efficiency King', icon: <Zap className="w-5 h-5" /> },
                    { id: Archetype.Protector, desc: 'Capital Defense', icon: <Shield className="w-5 h-5" /> },
                    { id: Archetype.Explorer, desc: 'Yield Hunter', icon: <Target className="w-5 h-5" /> }
                  ].map((arch) => (
                    <button 
                      key={arch.id} 
                      onClick={() => setOnboardData(prev => ({ ...prev, archetype: arch.id }))}
                      className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center gap-3 ${onboardData.archetype === arch.id ? 'bg-goldMid/10 border-goldMid text-goldLight' : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'}`}
                    >
                      <div className={`p-3 rounded-xl ${onboardData.archetype === arch.id ? 'bg-goldMid/20 text-goldMid' : 'bg-white/5 text-text-muted'}`}>
                        {arch.icon}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">{arch.id}</p>
                      <p className="text-[8px] opacity-40 uppercase tracking-[0.2em] font-bold">{arch.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setOnboardingStep(1)} className="flex-1 py-5 rounded-2xl font-bold text-text-muted border border-white/5 uppercase tracking-widest text-xs">Back</button>
                  <button onClick={() => setOnboardingStep(3)} className="flex-[2] gold-gradient py-5 rounded-2xl font-bold text-black uppercase tracking-widest text-xs">Initialize Model</button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {onboardingStep === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard tier={3} className="p-8">
                <h3 className="heading text-3xl mb-3 font-semibold text-platinum tracking-tight">Currency Node</h3>
                <p className="text-text-secondary text-sm mb-8 leading-relaxed">Define the primary unit of account for systemic indexing.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['USD', '$'], ['EUR', '€'], ['GBP', '£'], ['CAD', 'C$']
                  ].map(([code, sym]) => (
                    <button 
                      key={code} 
                      onClick={() => setOnboardData(prev => ({ ...prev, currency: code, sym }))}
                      className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-2 ${onboardData.currency === code ? 'bg-goldMid/10 border-goldMid text-goldLight' : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'}`}
                    >
                      <span className="text-2xl font-medium mono">{sym}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{code}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setOnboardingStep(2)} className="flex-1 py-5 rounded-2xl font-bold text-text-muted border border-white/5 uppercase tracking-widest text-xs">Back</button>
                  <button onClick={() => setOnboardingStep(4)} className="flex-[2] gold-gradient py-5 rounded-2xl font-bold text-black uppercase tracking-widest text-xs">Calibrate Feed</button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {onboardingStep === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard tier={3} className="p-8">
                <h3 className="heading text-3xl mb-3 font-semibold text-platinum tracking-tight">Liquidity Initializer</h3>
                <p className="text-text-secondary text-sm mb-8 leading-relaxed">Enter your current monthly ingress to prime the neural engine.</p>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-goldMid font-bold mb-2 block">Monthly Ingress ({onboardData.sym})</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-2xl mono text-platinum focus:border-goldMid outline-none transition-all font-bold"
                      placeholder="0.00"
                      value={onboardData.income}
                      onChange={e => setOnboardData(prev => ({ ...prev, income: e.target.value }))}
                    />
                  </div>
                  <div className="p-5 rounded-2xl bg-goldMid/5 border border-goldMid/10 border-dashed">
                     <p className="text-[10px] text-goldMid/60 leading-relaxed uppercase tracking-widest font-bold">Note: You can add expenses and debts later in the Intelligence Suite.</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setOnboardingStep(3)} className="flex-1 py-5 rounded-2xl font-bold text-text-muted border border-white/5 uppercase tracking-widest text-xs">Back</button>
                  <button onClick={finishOnboarding} className="flex-[2] gold-gradient py-5 rounded-2xl font-bold text-black uppercase tracking-widest text-xs">Go Live</button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!userData) return null;
    return (
      <ExecutiveDashboardWrapper>
      {(() => {
        switch (activeTab) {
      case Tab.Overview:
        return (
          <div className="space-y-8">
            <header className="mb-12 flex flex-col gap-1 items-center text-center">
              <span className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] font-bold opacity-70 mb-4 px-4 py-1 glass-tier-1 rounded-full border border-[#D4AF37]/20">Executive Dashboard • v4.2</span>
              <p className="subheading text-lg italic text-text-secondary opacity-80">Welcome back, {userData.profile.name.split(' ')[0]}. Strategic command is yours.</p>
              <h1 className="heading text-5xl font-semibold tracking-tight text-platinum mt-2">Asset Portfolio Overview</h1>
            </header>

            <div className="flex justify-center py-8">
              <WealthSphere score={stats.score} />
            </div>

            <div className="carousel scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 mb-16">
              <div className="carousel-item">
                <StatCard label="Total Equity" value={`${userData.profile.sym}${stats.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color={COLORS.goldMid} note="Capital Appreciation: +4.2%" />
              </div>
              <div className="carousel-item">
                <StatCard label="Neural Flow" value={`+${userData.profile.sym}${stats.totalIncome.toLocaleString()}`} color={COLORS.blue} note="Operational Inflow" />
              </div>
              <div className="carousel-item">
                <StatCard label="Burn Rate" value={`-${userData.profile.sym}${stats.totalExpenses.toLocaleString()}`} color={COLORS.red} note="Outflow Velocity" />
              </div>
              <div className="carousel-item">
                <StatCard label="Active Directives" value={`${userData.ventures.length}`} color={COLORS.platinum} note="98% Neural Sync" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <GlassCard tier={3} className="lg:col-span-2 p-0 overflow-hidden min-h-[300px] group interactive">
                <div className="p-8 pb-0 flex items-center justify-between">
                  <div>
                    <h3 className="heading text-xl font-semibold text-platinum">Net Worth Trajectory</h3>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-bold mt-2">6-Month Strategic Growth Pattern</p>
                  </div>
                  <div className="flex items-center gap-3 glass-tier-1 px-4 py-2 rounded-full border border-white/5">
                     <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse shadow-[0_0_10px_var(--color-green)]" />
                     <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E5E4E2] opacity-60">Neural Sync: Active</span>
                  </div>
                </div>
                <div className="h-[240px] w-full p-8 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TREND_DATA}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" hide />
                      <Tooltip 
                        cursor={{ stroke: "#D4AF37", strokeWidth: 1, strokeDasharray: '8 8' }}
                        contentStyle={{ 
                          backgroundColor: "rgba(15, 17, 21, 0.95)", 
                          border: `1px solid rgba(212, 175, 55, 0.4)`, 
                          borderRadius: '20px',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '12px',
                          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                          backdropFilter: 'blur(40px)'
                        }}
                        itemStyle={{ color: "#D4AF37" }}
                        labelStyle={{ color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.2em' }}
                      />
                      <Area type="monotone" dataKey="netWorth" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" animationDuration={3000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard tier={3} className="p-8 flex flex-col justify-between interactive">
                <div>
                  <h3 className="heading text-xl font-semibold text-platinum">Portfolio Heatmap</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-bold mt-2 mb-6">Asset Allocation Intensity</p>
                </div>
                <div className="h-40 w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={[
                        { name: 'Private Equity', size: 500 }, 
                        { name: 'Real Estate', size: 300 },
                        { name: 'Tech SaaS', size: 200 }, 
                        { name: 'Liquid Cash', size: 150 }
                      ]}
                      dataKey="size"
                      aspectRatio={4 / 3}
                      stroke="#0F1115"
                      fill="#D4AF37"
                      className="cursor-crosshair"
                    >
                      <Tooltip 
                        contentStyle={{ 
                          background: '#16181D', 
                          border: '1px solid #D4AF37', 
                          borderRadius: '12px',
                          fontSize: '10px',
                          color: '#E5E4E2' 
                        }} 
                      />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                  <span>Total Deployed</span>
                  <span className="mono text-platinum italic">{(stats.netWorth * 0.85).toLocaleString(undefined, { currency: 'USD', style: 'currency' })}</span>
                </div>
              </GlassCard>
            </div>

            <div className="carousel mt-12">
              {userData.ventures.length > 0 ? (
                userData.ventures.map((v, i) => (
                  <div key={v.id} className="carousel-item">
                    <VentureCard venture={v} onCommit={() => { setSelectedVentureForCall(v.name); setIsCapitalCallOpen(true); }} />
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 border border-dashed border-white/10 text-center rounded-[32px] glass-tier-1 w-full">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-platinum/20 font-bold">No assets currently deployed under this framework</p>
                </div>
              )}
            </div>
          </div>
        );
      case Tab.Income:
        return (
          <div className="space-y-6">
            <header className="flex items-center justify-between mb-8">
              <div>
                <h2 className="heading text-3xl font-semibold text-platinum">Income Streams</h2>
                <p className="text-text-muted text-[11px] uppercase tracking-[0.2em] font-bold mt-1">Sovereign Ingress & Strategic Inflow Analysis</p>
              </div>
              <button onClick={() => { setModalType(Tab.Income); setIsModalOpen(true); }} className="w-14 h-14 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all interactive">
                <Plus className="w-7 h-7" />
              </button>
            </header>
            
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Monthly Ingress" value={`${userData.profile.sym}${stats.totalIncome.toLocaleString()}`} color={COLORS.green} note="Neural Inflow Stability: High" />
              <StatCard label="Yield Sources" value={`${userData.income.length}`} color={COLORS.blue} note="Diversification Magnitude" />
            </div>

            <div className="space-y-3">
              {userData.income.map(i => (
                <GlassCard key={i.id} className="group p-5 hover:bg-white/[0.03] transition-all interactive">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 glass-tier-1 rounded-xl flex items-center justify-center text-green"><Plus className="w-5 h-5" /></div>
                      <div>
                        <p className="font-semibold text-platinum tracking-tight">{i.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold opacity-60 mt-1">{i.category} • {i.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="mono text-lg font-bold text-green">+{userData.profile.sym}{i.amount.toLocaleString()}</p>
                      <button onClick={() => removeItem('income', i.id)} className="text-[10px] uppercase font-bold text-red opacity-0 group-hover:opacity-100 transition-all">Purge</button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );
      case Tab.Expenses:
        const expenseCategories = (userData.expenses || []).reduce((acc: any, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + (Number(curr.amount) || 0);
          return acc;
        }, {});
        const pieData = Object.keys(expenseCategories).map((cat, i) => ({
          name: cat,
          value: expenseCategories[cat],
          color: [COLORS.platinum, COLORS.goldMid, '#2a2e3a', '#1a1f2a', COLORS.goldLight][i % 5]
        }));

        return (
          <div className="space-y-6">
            <header className="flex items-center justify-between mb-10">
              <div>
                <h2 className="heading text-4xl font-semibold tracking-tight text-platinum">Cash Flow & Expenses</h2>
                <p className="text-text-muted text-[11px] uppercase tracking-[0.2em] font-bold mt-2">Operational Outflow & Strategic Expense Management</p>
              </div>
              <button 
                onClick={() => { setModalType(Tab.Expenses); setIsModalOpen(true); }}
                className="w-14 h-14 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.6)] interactive"
              >
                <Plus className="w-8 h-8" />
              </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                <StatCard label="Monthly Velocity" value={`${userData.profile.sym}${stats.totalExpenses.toLocaleString()}`} color={COLORS.red} note="Outflow Intensity: High" />
                <StatCard label="Fiscal Reserve" value="92.4%" color={COLORS.platinum} note="Tax Optimization State" />
                <StatCard label="Solvency Buffer" value="6.8x" color={COLORS.blue} note="Operational Coverage" />
                <StatCard label="Audit Delta" value="-4.1%" color={COLORS.green} note="Efficiency Gains" />
              </div>
              <GlassCard tier={3} className="flex flex-col items-center justify-center p-6 interactive">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={10} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "rgba(15, 17, 21, 0.98)", 
                          border: `1px solid rgba(229, 228, 226, 0.1)`, 
                          borderRadius: '24px', 
                          fontSize: '11px', 
                          fontFamily: 'JetBrains Mono',
                          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                          backdropFilter: 'blur(50px)'
                        }}
                        itemStyle={{ color: COLORS.platinum }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[9px] uppercase font-bold tracking-[0.3em] text-[#D4AF37] mt-4 opacity-70 text-center">Category Allocation Matrix</div>
              </GlassCard>
            </div>

            <div className="space-y-3">
              {userData.expenses.map(exp => (
                <GlassCard key={exp.id} className="group p-5 hover:bg-white/[0.03] transition-all interactive">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 glass-tier-1 rounded-xl flex items-center justify-center text-red group-hover:scale-110 transition-transform"><ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-platinum tracking-tight">{exp.name}</p>
                          {exp.isTaxDeductible && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-goldMid/10 border border-goldMid/20 text-[8px] font-bold text-goldMid uppercase tracking-widest">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Tax
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mt-1">{exp.category} • {exp.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="mono text-lg font-bold text-red">-{userData.profile.sym}{exp.amount.toLocaleString()}</p>
                      <button onClick={() => removeItem('expenses', exp.id)} className="text-[10px] uppercase font-bold text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all">Audit</button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );
      case Tab.Debt:
        return (
          <div className="space-y-6">
            <header className="flex items-center justify-between mb-8">
              <div>
                <h2 className="heading text-3xl font-semibold text-platinum">Leverage Audit</h2>
                <p className="text-text-muted text-[11px] uppercase tracking-[0.2em] font-bold mt-1">Strategic Liability Mastery & Liquidation Logic</p>
              </div>
              <button onClick={() => { setModalType(Tab.Debt); setIsModalOpen(true); }} className="w-14 h-14 rounded-full border border-red/30 flex items-center justify-center text-red hover:bg-red/10 transition-all interactive">
                <Plus className="w-7 h-7" />
              </button>
            </header>

            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Total Exposure" value={`${userData.profile.sym}${stats.debt.toLocaleString()}`} color={COLORS.red} note="Risk Magnitude: Moderate" />
              <StatCard label="Wght. Interest" value="6.4%" color={COLORS.purple} note="Capital Friction Rate" />
            </div>

            <div className="space-y-4">
              {userData.debts.map(d => (
                <GlassCard key={d.id} className="p-8 group overflow-hidden interactive">
                  <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-red/10 border border-red/20 flex items-center justify-center text-red group-hover:scale-110 transition-transform">
                        <CreditCard className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="heading text-2xl font-semibold">{d.name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                           <span className="text-[10px] bg-red/10 text-red px-3 py-1 rounded-full font-bold uppercase tracking-widest">{d.rate}% APR</span>
                           <span className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold opacity-60">Fixed Amortization</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1 font-bold">Outstanding Principle</p>
                      <div className="mono text-3xl font-bold text-platinum">{userData.profile.sym}{d.balance.toLocaleString()}</div>
                      <button onClick={() => removeItem('debts', d.id)} className="text-[10px] uppercase font-bold text-red mt-2 opacity-30 group-hover:opacity-100 transition-all">Decommission</button>
                    </div>
                  </div>
                  
                  <div className="space-y-5 relative z-10">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(1 - d.balance / (d.balance * 1.8)) * 100}%` }} // Simulated progress
                        className="h-full bg-red shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-text-muted">
                      <span>Liquidation Forecast: Oct 2028</span>
                      <div className="flex items-center gap-2">
                         <span>Monthly Drain:</span>
                         <span className="text-platinum mono">{userData.profile.sym}{d.minPayment}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );
      case Tab.Ventures:
        const allocationData = (userData.ventures || []).reduce((acc: any, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + curr.invested;
          return acc;
        }, {});
        const treeData = [
          {
            name: 'Allocations',
            children: Object.keys(allocationData).map(cat => ({
              name: cat,
              size: allocationData[cat]
            }))
          }
        ];

        return (
          <div className="space-y-12 animate-fade-in">
            <header className="flex items-center justify-between mb-8">
              <div>
                <h2 className="heading text-4xl font-semibold text-platinum tracking-tight">Ventures & Acquisitions</h2>
                <p className="text-text-muted text-[11px] uppercase tracking-[0.3em] font-bold mt-2">Private Equity Console • Deployable Liquidity: $2.4M</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-platinum flex items-center justify-center text-[10px] font-bold text-black italic">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <button onClick={() => { setModalType(Tab.Ventures); setIsModalOpen(true); }} className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all shadow-gold interactive">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </header>

            {/* Venture Pipeline */}
            <section>
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.4em] text-text-muted">Venture Pipeline</h3>
                <div className="flex gap-2">
                   <div className="p-2 glass-tier-1 rounded-lg border border-white/5 opacity-50"><ChevronLeft className="w-4 h-4" /></div>
                   <div className="p-2 glass-tier-1 rounded-lg border border-white/5"><ChevronRight className="w-4 h-4" /></div>
                </div>
              </div>
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 px-1">
                {userData.ventures.map(v => (
                  <VentureCard 
                    key={v.id} 
                    venture={v} 
                    onCommit={() => { 
                      setSelectedVentureForCall(v.name);
                      setIsCapitalCallOpen(true);
                    }} 
                  />
                ))}
              </div>
            </section>

            {/* Capital Allocation Heatmap */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard tier={3} className="p-8 min-h-[400px] flex flex-col group">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h3 className="heading text-xl font-semibold text-platinum">Capital Allocation Matrix</h3>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold mt-2">Weight Distribution Heatmap</p>
                   </div>
                   <div className="p-3 bg-platinum/5 rounded-2xl border border-white/5">
                      <TrendingUp className="w-5 h-5 text-platinum" />
                   </div>
                </div>
                <div className="flex-1 w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={treeData[0].children}
                      dataKey="size"
                      aspectRatio={4/3}
                      stroke="#D4AF37"
                      fill="#1a1e26"
                    >
                      <Tooltip 
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                             return (
                               <div className="glass-tier-3 p-4 rounded-2xl border border-[#D4AF37]/30 shadow-2xl backdrop-blur-3xl">
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-1">{payload[0].name}</p>
                                  <p className="mono text-lg font-bold text-platinum">${payload[0].value.toLocaleString()}</p>
                               </div>
                             );
                          }
                          return null;
                        }}
                      />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 flex flex-wrap gap-4">
                   {treeData[0].children.map((c, i) => (
                     <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-goldMid" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">{c.name}</span>
                     </div>
                   ))}
                </div>
              </GlassCard>

              <div className="space-y-6">
                <GlassCard tier={2} className="p-8 interactive group border-l-2 border-[#D4AF37]">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-bold">Uncalled Commitments</p>
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]"><Lock className="w-5 h-5" /></div>
                  </div>
                  <p className="mono text-4xl font-bold text-platinum mb-2">$850,000</p>
                  <p className="text-[11px] text-text-muted italic leading-relaxed">System prediction: Next capital call likely in Q3 (Est. Sept 12)</p>
                </GlassCard>

                <GlassCard tier={2} className="p-8 interactive group">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-bold">Weighted Avg. TVPI</p>
                    <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center text-blue"><TrendingUp className="w-5 h-5" /></div>
                  </div>
                  <p className="mono text-4xl font-bold text-platinum mb-2">1.54x</p>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                      <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-blue" />
                   </div>
                </GlassCard>
              </div>
            </section>
          </div>
        );
      case Tab.Business:
        return (
          <div className="space-y-6">
            <header className="flex items-center gap-6 mb-8">
              <div className="w-14 h-14 gold-gradient rounded-2xl flex items-center justify-center text-black shadow-gold flex-shrink-0">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h2 className="heading text-3xl font-semibold text-platinum tracking-tight">{userData.profile.businessName || "Wealth Engine"}</h2>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold mt-1">Enterprise Financial Intelligence OS</p>
              </div>
            </header>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Recursive Revenue" value={`${userData.profile.sym}4,802`} color={COLORS.green} note="Gross Ingress" />
              <StatCard label="Ops. Outflow" value={`${userData.profile.sym}1,230`} color={COLORS.red} note="Liability Burn" />
              <StatCard label="Yield Spread" value={`${userData.profile.sym}3,572`} color={COLORS.goldMid} note="Net Profitability" />
              <StatCard label="Tax Custody" value={`${userData.profile.sym}893`} color={COLORS.blue} note="Regulatory Reserve" />
            </div>

            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 pt-2">
              {['Inventory Matrix', 'Liquidity Pending', 'Settlement Archives', 'Verified Settlements'].map((tab, idx) => (
                <button 
                  key={tab} 
                  className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap transition-all ${idx === 0 ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]' : 'glass-tier-1 text-text-muted hover:text-platinum'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <GlassCard className="p-0 overflow-hidden group">
               <div className="divide-y divide-white/[0.04]">
                  {[
                    { id: 'MTX-001', client: "Acme Dynamics", amount: 1200, status: "Settled", service: "Strategic Wealth Design" },
                    { id: 'MTX-002', client: "Sovereign AI", amount: 2500, status: "Awaiting", service: "Neural Network Training" },
                    { id: 'MTX-003', client: "Global Nexus", amount: 800, status: "Delinquent", service: "Architectural Consulting" }
                  ].map(inv => (
                    <div key={inv.id} className="p-6 flex flex-wrap items-center justify-between hover:bg-white/[0.02] transition-colors border-l-2 border-transparent hover:border-[#D4AF37]/40">
                       <div className="flex items-center gap-6">
                         <div className="mono text-[10px] text-text-muted font-bold px-3 py-1 glass-tier-1 rounded border border-white/5">{inv.id}</div>
                         <div>
                           <p className="text-base font-semibold text-platinum tracking-tight">{inv.client}</p>
                           <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold opacity-60 mt-1">{inv.service}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-8 text-right">
                         <div>
                            <p className={`text-[10px] uppercase font-bold tracking-[0.2em] mb-1 ${inv.status === 'Settled' ? 'text-green' : inv.status === 'Delinquent' ? 'text-red' : 'text-goldMid'}`}>{inv.status}</p>
                            <p className="mono text-xl font-bold text-platinum tracking-tighter">{userData.profile.sym}{inv.amount.toLocaleString()}</p>
                         </div>
                         <button className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${inv.status === 'Settled' ? 'border-green/20 text-green bg-green/5' : 'border-white/10 text-white/40 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'}`}>
                           {inv.status === 'Settled' ? <ShieldCheck className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                         </button>
                       </div>
                    </div>
                  ))}
               </div>
            </GlassCard>
          </div>
        );
      case Tab.AI:
        return (
          <div className="flex flex-col h-[calc(100vh-220px)]">
            <header className="flex items-center gap-6 mb-10">
              <div className="w-14 h-14 gold-gradient rounded-2xl flex items-center justify-center text-black shadow-gold flex-shrink-0 animate-pulse">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h2 className="heading text-3xl font-semibold text-platinum tracking-tight">Neural Council</h2>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold mt-1">Sovereign Strategic Intelligence • Active Inference</p>
              </div>
            </header>
            <div className="flex-1 overflow-hidden">
               <AIAdvisor userData={userData} stats={stats} update={update} />
            </div>
          </div>
        );
      case Tab.Profile:
        return (
          <div className="space-y-10">
            <header className="mb-12">
              <h2 className="heading text-4xl font-semibold text-platinum tracking-tight">Identity Console</h2>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold mt-2">Verified System Administrator • Bio-Sync v9.4</p>
            </header>

            <Tilt3D intensity={5}>
              <GlassCard tier={3} className="p-16 flex flex-col items-center interactive group overflow-hidden">
                <div className="relative mb-12">
                  <div className="w-40 h-40 rounded-full border border-[#D4AF37]/30 p-2 flex items-center justify-center relative z-10 bg-black/40 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                    <div className="w-full h-full bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-6xl font-bold text-[#D4AF37] italic shadow-inner">
                       {userData.profile.name.charAt(0)}
                    </div>
                  </div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-4 border border-dashed border-[#D4AF37]/10 rounded-full" 
                  />
                  <div className="absolute top-0 right-0 w-8 h-8 bg-green rounded-full border-4 border-obsidian flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)] z-20">
                     <Lock className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <h2 className="heading text-5xl font-semibold mb-3 text-platinum tracking-tighter text-center">{userData.profile.name}</h2>
                <div className="flex items-center gap-4 mb-14 text-center">
                   <div className="px-5 py-2 glass-tier-1 rounded-full border border-white/5 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                      <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#D4AF37]">Platinum Tier</span>
                   </div>
                   <span className="text-text-muted text-xs mono opacity-60 italic">{userData.profile.email}</span>
                </div>

                <div className="grid grid-cols-3 w-full gap-12 border-t border-white/[0.04] pt-12">
                   <div className="text-center">
                     <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-3 font-bold">Recursive Ingress</p>
                     <p className="mono text-2xl font-bold text-platinum tracking-tighter">{userData.profile.sym}{stats.totalIncome.toLocaleString()}</p>
                   </div>
                   <div className="text-center border-x border-white/5 px-6">
                     <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-3 font-bold">Burn Velocity</p>
                     <p className="mono text-2xl font-bold text-red tracking-tighter">-{userData.profile.sym}{stats.totalExpenses.toLocaleString()}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-3 font-bold">Psychometric</p>
                      <p className="heading text-2xl italic text-[#D4AF37] font-semibold tracking-tight">{userData.profile.archetype}</p>
                   </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
              </GlassCard>
            </Tilt3D>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { label: "High Performance Mode", sub: highPerfMode ? "Blurs & Grain Active" : "Simplified Rendering", icon: Activity, action: () => setHighPerfMode(!highPerfMode), color: highPerfMode ? COLORS.goldMid : COLORS.textMuted },
                 { label: "Neural Asset Manifest", sub: "Export Strategic Ingress/Outflow State (CSV)", icon: Globe, action: () => {
                    let data = "Type,Name,Amount,Category,Note,Metadata\n";
                    userData.income.forEach(i => { data += `Income,"${i.name}",${i.amount},"${i.category}","${i.note || ''}","${i.type}"\n`; });
                    userData.expenses.forEach(e => { data += `Expense,"${e.name}",${e.amount},"${e.category}","${e.note || ''}","${e.type}, Deductible: ${e.isTaxDeductible}"\n`; });
                    userData.debts.forEach(d => { data += `Debt,"${d.name}",${d.balance},Leverage,"Rate: ${d.rate}%","Min: ${d.minPayment}"\n`; });
                    userData.ventures.forEach(v => { data += `Venture,"${v.name}",${v.currentValue},"${v.category}","Equity: ${v.equityStake}%","TVPI: ${v.tvpi}, IRR: ${v.irr}%"\n`; });
                    
                    const blob = new Blob([data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `wealthos_manifest_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    showToast("Comprehensive Asset Manifest Exported", "success");
                 }, color: COLORS.green },
                 { label: "Executive Wealth Report", sub: "Compile print-ready PDF strategy report", icon: Download, action: () => {
                    showToast("Generating Executive Wealth Report... Compiling IRR projections and AI insights.", "info");
                 }, color: COLORS.goldMid },
                 { label: "Close Session", sub: "Safely terminate your private access session", icon: Zap, action: handleLogout, color: COLORS.platinum },
                 { label: "Wipe Local Cache", sub: "Permanently delete locally cached financial data", icon: History, action: () => {
                    if (confirm("Delete all locally cached data? Cloud data will remain secure.")) {
                       safeRemove('wo_users');
                       clearSession();
                       window.location.reload();
                    }
                 }, color: COLORS.red }
               ].map((setting, idx) => (
                 <button 
                   key={idx}
                   onClick={setting.action}
                   className="flex items-center justify-between p-6 glass-tier-2 rounded-[24px] hover:bg-white/[0.04] transition-all border border-white/5 active:scale-[0.99] group text-left"
                 >
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 glass shadow-inner rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: setting.color }}>
                         <setting.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-platinum tracking-tight">{setting.label}</p>
                        <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{setting.sub}</p>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-text-muted opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                 </button>
               ))}
            </div>

            <div className="text-center py-16 flex flex-col items-center gap-4 border-t border-white/5 opacity-20 hover:opacity-50 transition-opacity">
              <Logo />
              <div className="flex flex-col gap-1 items-center">
                <p className="text-[9px] uppercase tracking-[0.5em] font-bold text-[#D4AF37]">WealthOS Private Institutional Suite • v4.0</p>
                <p className="text-[8px] uppercase tracking-widest text-text-muted">High-Fidelity Financial Engineering Group • Non-Custodial Sync Active</p>
              </div>
            </div>
          </div>
        );
      default:
        }
      })()}
      </ExecutiveDashboardWrapper>
    );
  };


  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    let updatedData = { ...userData };
    const id = Math.random().toString(36).substr(2, 9);
    const common = { id, name: modalForm.name, amount: parseFloat(modalForm.amount) || 0, date: new Date().toISOString(), type: modalForm.type };

    if (modalType === Tab.Income) {
      updatedData.income = [...updatedData.income, { ...common, category: modalForm.category }];
    } else if (modalType === Tab.Expenses) {
      updatedData.expenses = [...updatedData.expenses, { ...common, category: modalForm.category, isTaxDeductible: modalForm.isTaxDeductible }];
    } else if (modalType === Tab.Debt) {
      updatedData.debts = [...updatedData.debts, { id, name: modalForm.name, balance: parseFloat(modalForm.balance) || 0, rate: parseFloat(modalForm.rate) || 0, minPayment: (parseFloat(modalForm.balance) || 0) * 0.03 }];
    } else if (modalType === Tab.Ventures) {
      updatedData.ventures = [...updatedData.ventures, { id, name: modalForm.name, category: modalForm.category, stage: 0.1, equityStake: 5, invested: parseFloat(modalForm.amount) || 0, currentValue: parseFloat(modalForm.amount) || 0, tvpi: 1, irr: 0, moic: 1 }];
    }

    update(() => updatedData);
    setIsModalOpen(false);
    setModalForm({ name: '', amount: '', category: '', type: 'personal', isTaxDeductible: false, balance: '', rate: '', target: '', deadline: '' });
    showToast(`${modalType} added`, "success");
  };

  const renderModal = () => {
    if (modalType === 'Commit') {
      return (
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden bg-black/95 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="w-full max-w-4xl p-12 flex flex-col items-center text-center relative"
              >
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-0 right-0 p-4 text-text-muted hover:text-platinum transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>

                <div className="mb-16">
                  <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center text-black shadow-gold mb-8 mx-auto">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h3 className="heading text-5xl font-bold text-platinum tracking-tighter mb-4 italic">Authorize Capital Call</h3>
                  <p className="text-text-muted text-xs uppercase tracking-[0.5em] font-bold">Strategic Asset Transfer Authorization v4.0</p>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 text-left border-y border-white/[0.05] py-12">
                   <div className="space-y-6">
                      <div>
                         <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-2">Legal Entity</p>
                         <p className="heading text-2xl font-semibold text-platinum">Sovereign Wealth Trust IV</p>
                      </div>
                      <div>
                         <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-2">Asset Identifier</p>
                         <p className="heading text-2xl font-semibold text-platinum">Project Obsidian (SaaS)</p>
                      </div>
                      <div>
                         <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-2">Commitment Volume</p>
                         <p className="mono text-4xl font-bold text-goldLight tracking-tighter">$250,000.00</p>
                      </div>
                   </div>
                   <div className="space-y-6 bg-white/[0.02] p-8 rounded-[32px] border border-white/5">
                      <p className="text-xs text-text-muted leading-relaxed italic">
                        "By authorizing this capital call, the undersigned party confirms the deployment of liquidity into the designated asset according to the terms of the Master Acquisition Agreement. This action is terminal and implies total commitment of secondary reserves."
                      </p>
                      <div className="pt-6 border-t border-white/5">
                         <div className="flex items-center gap-3 text-green mb-4">
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">End-to-End Encrypted Secure Line</span>
                         </div>
                         <div className="relative h-24 bg-black/40 rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                            <Edit3 className="absolute top-3 left-3 w-4 h-4 text-text-muted opacity-40" />
                            <span className="text-platinum/20 font-serif italic text-xl">Sign to Authorize...</span>
                         </div>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => { setIsModalOpen(false); showToast("Capital Commit Authorized", "success"); }}
                  className="px-16 py-6 gold-gradient text-black rounded-full font-bold text-base uppercase tracking-[0.4em] shadow-gold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Confirm Execution
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      );
    }

    if (modalType === 'Transfer') {
      return (
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden bg-black/95 backdrop-blur-3xl p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 1.1, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: 20 }}
                className="w-full max-w-lg p-10 glass-tier-3 rounded-[40px] border border-white/10 relative shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
              >
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 text-text-muted hover:text-platinum transition-colors z-20"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="mb-10 text-center">
                  <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center text-black shadow-gold mb-6 mx-auto">
                    <ArrowLeftRight className="w-8 h-8" />
                  </div>
                  <h3 className="heading text-3xl font-bold text-platinum tracking-tight italic">Liquid Asset Transfer</h3>
                  <p className="text-text-muted text-[10px] uppercase tracking-[0.4em] font-bold mt-2 opacity-60">Sovereign Treasury Routing Protocol</p>
                </div>
                
                <form className="space-y-8 relative z-10" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); showToast("Capital Transfer Executed", "success"); }}>
                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-3 block opacity-80">Source Account</label>
                      <select className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-platinum focus:border-goldMid outline-none appearance-none cursor-pointer transition-all hover:bg-white/[0.05]">
                        <option className="bg-black">Main Operating Reserve</option>
                        <option className="bg-black">Venture Liquidity Pool</option>
                        <option className="bg-black">Tax Custody Account</option>
                        <option className="bg-black">Offshore Diversified</option>
                      </select>
                    </div>

                    <div className="flex justify-center -my-2 relative z-20">
                      <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-text-muted animate-pulse">
                        <ArrowLeftRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-3 block opacity-80">Target Destination</label>
                      <select className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-platinum focus:border-goldMid outline-none appearance-none cursor-pointer transition-all hover:bg-white/[0.05]">
                        <option className="bg-black">Passive Yield Fund</option>
                        <option className="bg-black">Real Estate Trust</option>
                        <option className="bg-black">Emergency Strategic Liquid</option>
                        <option className="bg-black">Venture Commitment</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-3 block opacity-80">Liquidity Volume</label>
                    <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37] font-serif text-2xl">$</span>
                      <input 
                        required 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-5 text-2xl font-mono text-platinum focus:border-goldMid transition-all placeholder:opacity-20" 
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full gold-gradient text-black py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.3em] shadow-gold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    Confirm Execution <Check className="w-5 h-5" />
                  </button>
                </form>

                {/* Decorative Elements */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#D4AF37]/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue/5 blur-[80px] rounded-full pointer-events-none" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      );
    }

    return (
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
            <motion.div 
               initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             onClick={() => setIsModalOpen(false)}
             className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-[440px] glass-tier-3 p-8 sm:p-10 z-10 rounded-[32px] border border-white/10 relative shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="heading text-3xl font-semibold opacity-90">Add {modalType}</h3>
                <p className="text-text-muted text-xs mt-1 uppercase tracking-widest font-bold">Neural Asset Entry</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors group">
                <X className="w-5 h-5 text-text-muted group-hover:text-text-primary" />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-bold mb-2 block">Strategic Identifier (Name)</label>
                <input required type="text" placeholder="e.g. Monthly Capital Injection" className="w-full glass-tier-1 border border-white/5 rounded-xl px-5 py-4 text-sm focus:border-goldMid transition-all placeholder:opacity-30" value={modalForm.name} onChange={e => setModalForm({...modalForm, name: e.target.value})} />
              </div>

              {(modalType === Tab.Income || modalType === Tab.Expenses) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-bold mb-2 block">Quantum Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg heading">$</span>
                        <input required type="number" placeholder="0.00" className="w-full glass-tier-1 border border-white/5 rounded-xl pl-9 pr-5 py-4 text-sm font-mono focus:border-goldMid transition-all placeholder:opacity-30" value={modalForm.amount} onChange={e => setModalForm({...modalForm, amount: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-bold mb-2 block">Categorization</label>
                      <input required type="text" placeholder="Revenue" className="w-full glass-tier-1 border border-white/5 rounded-xl px-5 py-4 text-sm focus:border-goldMid transition-all placeholder:opacity-30" value={modalForm.category} onChange={e => setModalForm({...modalForm, category: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 glass-tier-1 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-primary">Source Attribution</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">Asset Origin</span>
                    </div>
                    <div className="flex bg-black/40 p-1 rounded-lg">
                      {['personal', 'business'].map(t => (
                        <button 
                          key={t}
                          type="button"
                          onClick={() => setModalForm({...modalForm, type: t as any})}
                          className={`px-3 py-1 text-[9px] uppercase font-bold tracking-widest rounded-md transition-all ${modalForm.type === t ? 'bg-goldMid text-black' : 'text-text-muted hover:text-text-secondary'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {modalType === Tab.Expenses && (
                    <div className="flex items-center gap-3 mt-4">
                      <input type="checkbox" id="tax" className="w-4 h-4 rounded border-white/10 bg-white/5 accent-goldMid" checked={modalForm.isTaxDeductible} onChange={e => setModalForm({...modalForm, isTaxDeductible: e.target.checked})} />
                      <label htmlFor="tax" className="text-xs text-text-secondary cursor-pointer">Mark as Strategic Tax Deduction</label>
                    </div>
                  )}
                </>
              )}

              {modalType === Tab.Debt && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-bold mb-2 block">Principal Liability</label>
                    <input required type="number" placeholder="Balance" className="w-full glass-tier-1 border border-white/5 rounded-xl px-5 py-4 text-sm font-mono focus:border-red transition-all placeholder:opacity-30" value={modalForm.balance} onChange={e => setModalForm({...modalForm, balance: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-bold mb-2 block">Interest Rate (%)</label>
                    <input required type="number" placeholder="APR" className="w-full glass-tier-1 border border-white/5 rounded-xl px-5 py-4 text-sm font-mono focus:border-red transition-all placeholder:opacity-30" value={modalForm.rate} onChange={e => setModalForm({...modalForm, rate: e.target.value})} />
                  </div>
                </div>
              )}

              {modalType === Tab.Ventures && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-bold mb-2 block">Initial Deployment ($)</label>
                    <input required type="number" placeholder="0.00" className="w-full glass-tier-1 border border-white/5 rounded-xl px-5 py-4 text-sm font-mono focus:border-goldMid transition-all placeholder:opacity-30" value={modalForm.amount} onChange={e => setModalForm({...modalForm, amount: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-bold mb-2 block">Asset Category</label>
                    <input required type="text" placeholder="Tech / Real Estate" className="w-full glass-tier-1 border border-white/5 rounded-xl px-5 py-4 text-sm focus:border-goldMid transition-all placeholder:opacity-30" value={modalForm.category} onChange={e => setModalForm({...modalForm, category: e.target.value})} />
                  </div>
                </div>
              )}
              
              <button type="submit" className="w-full gold-gradient text-[#060612] py-4 rounded-xl font-bold text-sm shadow-gold hover:scale-[1.01] hover:brightness-110 active:scale-[0.98] transition-all mt-6 uppercase tracking-widest">
                Commit to Neural Records
              </button>
            </form>

            <div className="absolute top-0 right-0 w-32 h-32 bg-goldMid/5 blur-[50px] -mr-16 -mt-16 rounded-full pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    );
  };

  // --- Main Wrapper ---
  return (
    <AnimatePresence mode="wait">
      {isBooting && <SplashLoader key="splash-loader" />}
      
      {isUnlocking && <VaultDecrypting key="decrypting" />}

      {!isBooting && screen === 'auth' && (
        <motion.div 
          key="auth-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen"
        >
          <SovereignGate 
            onLoginStart={() => setIsUnlocking(true)} 
            onSuccess={() => setIsUnlocking(false)} 
          />
        </motion.div>
      )}

      {!isBooting && screen === 'onboarding' && (
        <motion.div 
          key="onboarding-flow"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="min-h-screen"
        >
          {renderOnboarding()}
        </motion.div>
      )}

      {!isBooting && screen === 'app' && !isUnlocking && (
        <motion.div 
          key="app-core"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={SPRING_CONFIG}
          className="min-h-screen"
        >
          {/* Main App Layout */}
          <div className="min-h-screen bg-[#0F1115] text-[#E5E4E2] font-sans selection:bg-goldMid selection:text-black flex">
            <MeshBg />
            {renderModal()}
            
            {/* Sidebar for Desktop */}
            <aside className="hidden lg:flex flex-col w-24 border-r border-white/[0.04] h-screen sticky top-0 bg-[#0F1115]/50 backdrop-blur-[60px] items-center py-12 z-[110]">
              <div className="mb-16">
                 <Logo variant="mark" />
              </div>
              
              <div className="flex-1 flex flex-col gap-10">
                 {[
                   { tab: Tab.Overview, icon: LayoutDashboard },
                   { tab: Tab.AI, icon: Cpu },
                   { tab: Tab.Business, icon: Briefcase },
                   { tab: Tab.Profile, icon: User }
                 ].map(({ tab, icon: Icon }) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all interactive relative ${activeTab === tab ? 'text-[#D4AF37] bg-white/5' : 'text-text-muted hover:text-platinum hover:bg-white/5'}`}
                    >
                      <Icon size={22} strokeWidth={1.5} />
                      {activeTab === tab && (
                        <motion.div layoutId="sidebar-nav" className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.2)] border border-[#D4AF37]/30" />
                      )}
                    </button>
                 ))}
              </div>

              <div className="mt-auto flex flex-col items-center gap-10">
                 <div className="text-[9px] uppercase tracking-[0.4em] text-text-muted font-bold vertical-text py-4 pointer-events-none opacity-30">Est. 2026</div>
                 <div 
                   onClick={() => setActiveTab(Tab.Profile)}
                   className="w-12 h-12 rounded-2xl border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] heading text-xl font-bold cursor-pointer hover:bg-[#D4AF37]/10 transition-all interactive italic"
                 >
                   {userData?.profile.name.charAt(0) || 'U'}
                 </div>
              </div>
           </aside>

           <div className="flex-1 flex flex-col min-w-0">
             {/* Mobile Header (Hidden on LG) */}
             <nav className="sticky top-0 z-[100] h-[64px] border-b border-white/[0.04] bg-[#0F1115]/60 backdrop-blur-[40px] flex items-center justify-between px-8 lg:hidden">
               <Logo />
               <div 
                 onClick={() => setActiveTab(Tab.Profile)}
                 className="w-10 h-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] heading text-lg font-bold cursor-pointer hover:bg-[#D4AF37]/10 transition-all interactive"
               >
                 {userData?.profile.name.charAt(0) || 'U'}
               </div>
             </nav>

             {/* Desktop Navbar Sub-navigation */}
             <div className="hidden lg:flex h-20 border-b border-white/[0.04] items-center px-12 justify-between bg-obsidian/20 backdrop-blur-md sticky top-0 z-[90]">
                <div className="flex gap-10">
                   {[Tab.Overview, Tab.Income, Tab.Expenses, Tab.Debt, Tab.Ventures, Tab.Business].map(t => (
                     <button 
                       key={t}
                       onClick={() => setActiveTab(t)}
                       className={`text-[10px] uppercase tracking-[0.25em] font-bold transition-all interactive relative py-2 ${activeTab === t ? 'text-[#D4AF37]' : 'text-text-muted hover:text-platinum'}`}
                     >
                       {t}
                       {activeTab === t && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />}
                     </button>
                   ))}
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex flex-col items-end">
                     <span className="text-[8px] uppercase tracking-[0.3em] text-text-muted font-bold">Neural Engine v3.2</span>
                     <span className="text-[10px] text-[#D4AF37] opacity-60 italic font-medium">Strategic Tier 1</span>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center relative">
                      <div className="w-2 h-2 rounded-full bg-green animate-pulse shadow-[0_0_12px_rgba(46,204,113,0.6)]" />
                      <div className="absolute inset-0 border border-green/20 rounded-full animate-ping opacity-20" />
                   </div>
                </div>
             </div>

             {/* Main Content Area */}
             <div className="lg:hidden h-4" /> {/* Spacer for bottom bar */}
             <main className="max-w-[1100px] mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-16 w-full pb-32 lg:pb-16">
                {renderContent()}
              </main>
            </div>

            {/* Mobile Command Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-[150] lg:hidden h-20 bg-[#0F1115]/80 backdrop-blur-3xl border-t border-white/[0.04] flex items-center justify-around px-6 pb-2">
              {[
                { tab: Tab.Overview, icon: LayoutDashboard },
                { tab: Tab.AI, icon: Cpu },
                { tab: Tab.Business, icon: Briefcase },
                { tab: Tab.Profile, icon: User }
              ].map(({ tab, icon: Icon }) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`p-3 rounded-xl transition-all relative ${activeTab === tab ? 'text-[#D4AF37] bg-white/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'text-text-muted'}`}
                >
                  <Icon size={22} strokeWidth={1.5} />
                  {activeTab === tab && (
                    <motion.div layoutId="mobile-nav" className="absolute inset-0 rounded-xl border border-[#D4AF37]/30" />
                  )}
                </button>
              ))}
            </nav>

           {/* Guest Mode Badge & Finalization Prompt */}
           {isGuest && (
             <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6 pointer-events-none">
               <GlassCard tier={3} className="p-4 flex items-center justify-between border-blue/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-blue">
                     <Database className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-platinum tracking-tight leading-none">Volatile Session</p>
                     <p className="text-[9px] text-text-muted mt-1 uppercase tracking-widest font-bold">Data will be purged on exit</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => {
                     handleLogout();
                     showToast("Session cleared. Establishing Identity...", "info");
                   }}
                   className="px-4 py-2 bg-blue/10 hover:bg-blue/20 text-blue rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border border-blue/20"
                 >
                   Secure Data
                 </button>
               </GlassCard>
             </div>
           )}

           <CapitalCallOverlay 
            isOpen={isCapitalCallOpen} 
            onClose={() => setIsCapitalCallOpen(false)}
            ventureName={selectedVentureForCall || "Strategic Venture"}
            onComplete={() => {
               setIsCapitalCallOpen(false);
               showToast("Capital Deployment Finalized", "success");
            }}
          />

           {/* Mobile Bottom Nav - Floating Style */}
           <footer className="fixed bottom-0 left-0 right-0 z-[100] p-6 flex justify-center pointer-events-none lg:hidden">
             <div className="glass rounded-[32px] px-8 py-3 flex items-center gap-10 shadow-2xl pointer-events-auto">
               {[
                 { id: Tab.Overview, icon: "◈", label: "Intelligence" },
                 { id: Tab.Expenses, icon: "−", label: "Outflow" },
                 { id: Tab.AI, icon: "◉", label: "Council" },
                 { id: Tab.Business, icon: "◇", label: "Engine" },
                 { id: Tab.Profile, icon: "○", label: "Console" },
               ].map(t => (
                 <button 
                   key={t.id}
                   onClick={() => setActiveTab(t.id)}
                   className={`flex flex-col items-center gap-1 transition-all group interactive ${activeTab === t.id ? 'text-[#D4AF37]' : 'text-text-muted hover:text-[#D4AF37]'}`}
                   style={activeTab === t.id ? { filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.6))' } : {}}
                 >
                   <span className={`text-xl leading-none group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.5)] transition-all ${activeTab === t.id ? 'font-bold' : ''}`}>{t.icon}</span>
                 </button>
               ))}
             </div>
           </footer>

           {/* Toast System */}
           <div className="fixed top-8 right-8 z-[2000] flex flex-col items-end pointer-events-none gap-3">
             <AnimatePresence>
               {toasts.map(t => (
                 <motion.div 
                   key={t.id}
                   initial={{ x: 100, opacity: 0, scale: 0.9 }}
                   animate={{ x: 0, opacity: 1, scale: 1 }}
                   exit={{ x: 100, opacity: 0, scale: 0.9 }}
                   className={`p-5 rounded-2xl glass-tier-3 flex items-center gap-4 border-l-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] pointer-events-auto min-w-[320px] ${
                     t.type === 'success' ? 'border-goldMid' : 
                     t.type === 'error' ? 'border-red' : 
                     t.type === 'warning' ? 'border-orange-500' : 'border-blue'
                   }`}
                 >
                   <div className={`p-2.5 rounded-xl ${
                     t.type === 'success' ? 'bg-goldMid/10 text-goldMid' : 
                     t.type === 'error' ? 'bg-red/10 text-red' : 
                     t.type === 'warning' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue/10 text-blue'
                   }`}>
                     {t.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : 
                      t.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : 
                      t.type === 'warning' ? <Info className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                   </div>
                   <div className="flex-1">
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-text-muted">{t.type}</p>
                      <p className="text-xs font-semibold text-platinum mt-0.5">{t.msg}</p>
                   </div>
                   <button 
                     onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                     className="opacity-20 hover:opacity-100 transition-opacity"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Sub-components ---

function AIAdvisor({ userData, stats, update }: { userData: UserData, stats: any, update: (fn: (prev: UserData) => UserData) => void }) {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = userData.chatHistory || [];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (msgOverride?: string) => {
    const text = msgOverride || inputMessage;
    if (!text.trim()) return;

    const newChatHistory = [...messages, { role: 'user', content: text }];
    
    // Optimistic update
    update(prev => ({ ...prev, chatHistory: newChatHistory }));
    setInputMessage("");
    setIsTyping(true);

    try {
      const context: FinancialContext = {
        name: userData.profile.name,
        goal: userData.profile.goal,
        archetype: userData.profile.archetype,
        totalIncome: stats.totalIncome,
        totalExpenses: stats.totalExpenses,
        netFlow: stats.netFlow,
        debt: stats.debt,
        savingsRate: stats.savingsRate,
        incomeSources: userData.income,
        topExpenses: userData.expenses.slice(0, 6),
        allDebts: userData.debts,
        allVentures: userData.ventures
      };

      const response = await getFinancialAdvice(
        context, 
        text, 
        messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: m.content || '' }))
      );

      update(prev => ({ 
        ...prev, 
        chatHistory: [...prev.chatHistory, { role: 'ai', content: response }] 
      }));
    } catch (e) {
      update(prev => ({ 
        ...prev, 
        chatHistory: [...prev.chatHistory, { role: 'ai', content: "Neural Core offline. Re-establishing link..." }] 
      }));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4 pb-24 space-y-6 flex flex-col">
        {messages.length === 0 && (
          <div className="space-y-12 py-16 text-center max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="w-24 h-24 gold-gradient rounded-[32px] flex items-center justify-center text-black shadow-[0_0_60px_rgba(212,175,55,0.2)] animate-float interactive group">
                <Brain className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="heading text-2xl font-bold tracking-tight text-platinum">Sovereign Concierge</h3>
                <p className="text-text-muted text-[10px] uppercase tracking-[0.4em] font-bold opacity-60">Neural Strategic Interface v4.0</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Analyze Portfolios", desc: "Identify Alpha across all active ventures", icon: <TrendingUp className="w-4 h-4" /> },
                { label: "Debt Liquidation", desc: "Aggressive repayment velocity pathways", icon: <ArrowDownCircle className="w-4 h-4" /> },
                { label: "Tax Optimization", desc: "Simulate tax shielding on luxury assets", icon: <ShieldCheck className="w-4 h-4" /> }
              ].map((s, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSend(s.label)}
                  className="p-6 text-left glass-tier-2 rounded-[24px] hover:border-goldMid/30 hover:bg-white/[0.03] transition-all group interactive"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-platinum group-hover:text-goldMid transition-colors">{s.label}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-4`}
          >
            {m.role === 'ai' && (
              <div className="w-10 h-10 gold-gradient rounded-xl flex-shrink-0 flex items-center justify-center text-black shadow-gold self-start mt-1">
                <Brain className="w-5 h-5" />
              </div>
            )}
            <div className={`
              max-w-[80%] p-6 rounded-[28px] text-[13px] leading-relaxed relative overflow-hidden
              ${m.role === 'user' 
                ? 'bg-[#1a1e26] border border-white/10 text-platinum rounded-tr-none' 
                : 'glass-tier-3 text-platinum border border-white/10 rounded-tl-none shadow-2xl'
              }
            `}>
              {m.role === 'ai' && (
                <div className="absolute top-0 left-0 w-1 h-full gold-gradient opacity-40" />
              )}
              <Markdown>{m.content}</Markdown>
            </div>
          </motion.div>
        ))}

        {isTyping && (
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start gap-4"
          >
            <div className="w-10 h-10 glass-tier-2 rounded-xl flex-shrink-0 flex items-center justify-center text-goldMid border border-white/5">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div className="glass-tier-3 p-4 px-6 rounded-full border border-goldMid/20">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-goldMid" 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} className="pt-2" />
      </div>

      <div className="absolute bottom-4 left-0 right-0 p-4">
        <div className="glass-tier-3 p-2 pl-6 rounded-full border border-white/10 flex items-center gap-3 interactive group shadow-2xl">
          <input 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Consult with the Sovereign Strategist..."
            className="flex-1 bg-transparent border-none outline-none text-platinum text-sm placeholder:text-text-muted placeholder:opacity-50 font-sans"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!inputMessage.trim() || isTyping}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              inputMessage.trim() ? 'gold-gradient text-black shadow-gold scale-100 hover:rotate-12' : 'bg-white/5 text-white/20 scale-90'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-center mt-3 text-text-muted opacity-40">WealthOS AI v4.0.1 • End-to-End Encrypted</p>
      </div>
    </div>
  );
}

