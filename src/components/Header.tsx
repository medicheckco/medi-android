import { useState, useEffect, useRef } from 'react';
import { User, LogOut, ChevronDown, Download, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface HeaderProps {
  user: any;
  isDataLoading: boolean;
  onProfileSettingsClick: () => void;
  onImportExportClick: () => void;
  onAdminSettingsClick: () => void;
  onLogout: () => void;
}

export const Header = ({
  user,
  isDataLoading,
  onProfileSettingsClick,
  onImportExportClick,
  onAdminSettingsClick,
  onLogout,
}: HeaderProps) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'admin' || user?.email === 'medistock.us@gmail.com';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  return (
    <header className="app-header relative z-50 bg-white border-b border-premium-border/60 shadow-premium-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-8">
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="w-10 h-10 sm:w-14 sm:h-14 relative group cursor-pointer active:scale-95 transition-transform">
            <img 
              src="/mask-icon.svg" 
              alt="MediTrack Logo" 
              className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-xl font-bold text-premium-title tracking-tight leading-none mb-1">MediTrack</h1>
            <p className="text-[10px] sm:text-xs text-premium-subtitle font-medium uppercase tracking-widest">Inventory System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 pr-3 sm:pr-4 bg-white hover:bg-premium-bg rounded-card transition-all border border-premium-border group shadow-premium-soft"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-card bg-white flex items-center justify-center border border-premium-border shadow-premium-soft overflow-hidden group-hover:border-brand-blue-start transition-all">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-premium-subtitle" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-premium-title truncate max-w-[120px]">{user?.displayName?.split(' ')[0] || 'Account'}</p>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-premium-subtitle transition-transform duration-300",
                isUserDropdownOpen && "rotate-180"
              )} />
            </button>

            <AnimatePresence>
              {isUserDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-xs font-black text-slate-900 truncate">{user?.displayName}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onProfileSettingsClick();
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      onImportExportClick();
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Import & Export
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        onAdminSettingsClick();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border-t border-slate-50 mt-1"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      Admin Settings
                    </button>
                  )}
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
