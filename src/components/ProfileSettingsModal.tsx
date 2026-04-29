import { motion } from 'motion/react';
import { XCircle, User as UserIcon, CheckCircle2, Zap, FileText, RefreshCw, Trash2, Mail } from 'lucide-react';
import { User, UserStats } from '../types';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface ProfileSettingsModalProps {
  user: User | null;
  geminiScanCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  onClose: () => void;
  onDeleteAllData: () => void;
  onHardSync: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function ProfileSettingsModal({
  user,
  geminiScanCount,
  totalInputTokens,
  totalOutputTokens,
  onClose,
  onDeleteAllData,
  onHardSync,
  showToast
}: ProfileSettingsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSyncProfile = async () => {
    if (!user) return;
    try {
      setIsSubmitting(true);
      // Profile is auto-synced locally
      showToast("Profile up to date!");
    } catch (e) {
      showToast("Sync failed: " + (e instanceof Error ? e.message : String(e)), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    showToast("Email verification is handled by your local administrator.");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="p-3 sm:p-5 pb-0 flex items-center justify-between shrink-0">
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">Profile Settings</h2>
          <button 
            onClick={onClose} 
            className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all"
          >
            <XCircle className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-3 sm:p-5 custom-scrollbar flex-1">
          <div className="space-y-4 sm:space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-50 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-2 sm:mb-4 border-2 sm:border-4 border-white shadow-lg sm:shadow-xl relative overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-7 h-7 sm:w-10 sm:h-10 text-blue-600" />
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-4 border-white rounded-full flex items-center justify-center shadow-md sm:shadow-lg bg-emerald-500">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-lg font-black text-slate-900 break-all">{user?.email}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Professional Account</p>
                  <span className="text-slate-300">•</span>
                  <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600">
                    Verified
                  </p>
                </div>
                
                {!user && (
                  <button
                    onClick={handleResendVerification}
                    className="mt-3 text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <Mail className="w-3 h-3" />
                    Request Verification
                  </button>
                )}
              </div>

            <div className="space-y-2 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="p-3 sm:p-5 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">AI Scans</p>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600 fill-current" />
                    <p className="text-sm sm:text-lg font-black text-slate-900">{geminiScanCount}</p>
                  </div>
                </div>
                <div className="p-3 sm:p-5 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Total Tokens</p>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <FileText className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-indigo-600" />
                    <p className="text-sm sm:text-lg font-black text-slate-900">{totalInputTokens + totalOutputTokens}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="p-3 sm:p-5 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Input Tokens</p>
                  <p className="text-xs sm:text-base font-black text-slate-700">{totalInputTokens.toLocaleString()}</p>
                </div>
                <div className="p-3 sm:p-5 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Output Tokens</p>
                  <p className="text-xs sm:text-base font-black text-slate-700">{totalOutputTokens.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-3 sm:p-5 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Database ID</p>
                <code className="text-[9px] sm:text-[11px] font-mono text-slate-500 break-all leading-relaxed">{user?.id}</code>
              </div>
              
              <div className="pt-2 sm:pt-4 space-y-2 sm:space-y-3">
                <button
                  onClick={handleSyncProfile}
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-4 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm flex items-center justify-center gap-2 sm:gap-3 hover:bg-blue-100 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  Sync Profile Data
                </button>
                
                <button
                  onClick={onHardSync}
                  className="w-full py-2.5 sm:py-4 bg-slate-50 text-slate-600 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm flex items-center justify-center gap-2 sm:gap-3 hover:bg-slate-100 active:scale-[0.98] transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  Repair Data Sync
                </button>
                
                <button
                  onClick={onDeleteAllData}
                  className="w-full py-2.5 sm:py-4 bg-rose-50 text-rose-600 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm flex items-center justify-center gap-2 sm:gap-3 hover:bg-rose-100 active:scale-[0.98] transition-all group"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                  Clear Database
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5 pt-0 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 text-xs sm:text-sm"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
