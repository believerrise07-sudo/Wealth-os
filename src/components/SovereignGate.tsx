import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface SovereignGateProps {
  onSuccess?: () => void;
  onLoginStart?: () => void;
}

const SovereignGate: React.FC<SovereignGateProps> = ({ onSuccess, onLoginStart }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- CRYPTOGRAPHIC STRENGTH LOGIC ---
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculateStrength(password);
  const strengthLabels = ["Unsecured", "Weak", "Moderate", "Strong", "Vault Grade"];

  // --- AUTHENTICATION HANDLER ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isLogin && strengthScore < 3) {
      setError("Cryptographic strength must be 'Strong' or higher to establish identity.");
      setIsLoading(false);
      return;
    }

    if (onLoginStart) onLoginStart();

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      // Clean, human-readable error handling
      if (err.code === 'auth/user-not-found') setError("Identity not found. Please establish a new identity.");
      else if (err.code === 'auth/wrong-password') setError("Invalid cryptographic credential.");
      else if (err.code === 'auth/email-already-in-use') setError("This identity is already secured in our system.");
      else if (err.code === 'auth/invalid-credential') setError("Invalid cryptographic credential.");
      else setError("Connection error. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0F1115] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Subtle background grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md bg-[#16181D]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 relative z-10 shadow-2xl rounded-2xl"
      >
        <div className="mb-12 text-center">
          <div className="w-12 h-12 border border-[#D4AF37] rotate-45 mx-auto mb-8 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <div className="-rotate-45 font-serif text-[#D4AF37] text-xl font-bold">W</div>
          </div>
          <h2 className="text-[#E5E4E2] text-2xl font-serif italic mb-2 tracking-wide">
            {isLogin ? 'Sovereign Access' : 'Establish Identity'}
          </h2>
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#E5E4E2]/40">
            {isLogin ? 'Authenticate to enter your vault' : 'Secure your private wealth console'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {/* Email Field */}
          <div className="relative">
            <label className="text-[8px] uppercase tracking-widest text-[#E5E4E2]/40 block mb-2">Secure Email</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-4 text-[#E5E4E2]/30" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm text-[#E5E4E2] outline-none rounded-lg focus:border-[#D4AF37]/50 transition-colors" 
                placeholder="director@firm.com" 
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="relative">
            <label className="text-[8px] uppercase tracking-widest text-[#E5E4E2]/40 block mb-2">Cryptographic Key</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-4 text-[#E5E4E2]/30" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 pr-12 text-sm text-[#E5E4E2] font-mono tracking-widest outline-none rounded-lg focus:border-[#D4AF37]/50 transition-colors" 
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-[#E5E4E2]/30 hover:text-[#D4AF37] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Visual Password Strength Meter (Only on Registration) */}
          <AnimatePresence>
            {!isLogin && password.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2 mt-4">
                  <span className="text-[8px] uppercase tracking-widest text-[#E5E4E2]/40">Security Integrity</span>
                  <span className={`text-[8px] uppercase tracking-widest font-bold ${strengthScore >= 3 ? 'text-[#D4AF37]' : 'text-[#E5E4E2]/60'}`}>
                    {strengthLabels[strengthScore]}
                  </span>
                </div>
                <div className="flex gap-1 h-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 transition-all duration-500 rounded-full ${strengthScore >= i + 1 ? 'bg-[#D4AF37] shadow-[0_0_5px_rgba(212,175,55,0.5)]' : 'bg-white/10'}`} 
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium Error Handling */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 flex items-center text-red-400 rounded-lg"
              >
                <AlertCircle size={14} className="mr-2 shrink-0" />
                <p className="text-[10px] tracking-wide">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 mt-4 bg-[#D4AF37] text-[#0F1115] font-black text-[10px] uppercase tracking-[0.4em] rounded-lg hover:bg-[#E5E4E2] transition-colors duration-500 flex justify-center items-center relative overflow-hidden group disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[#0F1115] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="relative z-10">{isLogin ? 'Authenticate' : 'Initialize Vault'}</span>
                {/* Subtle shine effect on button */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); setPassword(''); }}
            className="text-[9px] uppercase tracking-widest text-[#E5E4E2]/40 hover:text-[#D4AF37] transition-colors"
          >
            {isLogin ? 'Establish new identity' : 'Return to authentication'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SovereignGate;
