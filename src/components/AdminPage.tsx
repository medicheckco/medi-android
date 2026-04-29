import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, Package, Zap, BarChart3, ChevronUp, ChevronDown, Search, Mail, User as UserIcon, Clock, ArrowLeft } from 'lucide-react';
import { UserStats } from '../types';
import { format } from 'date-fns';
import { toDate } from '../lib/utils';
import { apiService } from '../services/api';

interface AdminPageProps {
  onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [totals, setTotals] = useState({ users: 0, medications: 0, batches: 0, aiScans: 0, gs1Scans: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserStats; direction: 'asc' | 'desc' }>({
    key: 'medicationCount',
    direction: 'desc'
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAdminStats();
        setUsers(data.users);
        setTotals({
          users: data.users.length,
          medications: data.totals.medications,
          batches: data.totals.batches,
          aiScans: data.totals.aiScans || 0,
          gs1Scans: data.totals.gs1Scans || 0
        });
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const sortedUsers = useMemo(() => {
    let filtered = users.filter(u => 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === bVal) return 0;
      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [users, searchTerm, sortConfig]);

  const handleSort = (key: keyof UserStats) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-10">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-600/20 shrink-0">
            <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-current" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Admin Settings</h2>
            <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">Platform Analytics</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-6" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Platform Data</p>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-12">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Users</p>
              </div>
              <p className="text-2xl sm:text-4xl font-black text-slate-900">{totals.users}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 sm:p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meds</p>
              </div>
              <p className="text-2xl sm:text-4xl font-black text-slate-900">{totals.medications}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 sm:p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600 fill-current" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI</p>
              </div>
              <p className="text-2xl sm:text-4xl font-black text-slate-900">{totals.aiScans}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 sm:p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GS1</p>
              </div>
              <p className="text-2xl sm:text-4xl font-black text-slate-900">{totals.gs1Scans}</p>
            </motion.div>
          </div>

          {/* User Breakdown Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">User Breakdown</h3>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/5 transition-all outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th 
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleSort('medicationCount')}
                    >
                      <div className="flex items-center gap-1">
                        Items
                        {sortConfig.key === 'medicationCount' && (
                          sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleSort('geminiScanCount')}
                    >
                      <div className="flex items-center gap-1">
                        AI Scans
                        {sortConfig.key === 'geminiScanCount' && (
                          sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleSort('gs1ScanCount')}
                    >
                      <div className="flex items-center gap-1">
                        GS1 Scans
                        {sortConfig.key === 'gs1ScanCount' && (
                          sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedUsers.map((user, idx) => (
                    <tr key={`desktop-user-${user.uid}-${idx}`} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-white transition-colors">
                            <UserIcon className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{user.displayName}</p>
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <p className="text-[11px] font-bold text-slate-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-base font-black text-slate-900">{user.medicationCount}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.batchCount} batches</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500 fill-current" />
                          <span className="text-base font-black text-slate-900">{user.geminiScanCount}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-emerald-500" />
                          <span className="text-base font-black text-slate-900">{user.gs1ScanCount}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-[11px] font-bold uppercase tracking-widest">
                            {user.lastLogin ? format(toDate(user.lastLogin), 'MMM d, HH:mm') : 'Never'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {sortedUsers.map((user, idx) => (
                <div key={`mobile-user-${user.uid}-${idx}`} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                      <UserIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{user.displayName}</p>
                      <p className="text-[11px] font-bold text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-slate-50 p-3 rounded-2xl text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Items</p>
                      <p className="text-sm font-black text-slate-900">{user.medicationCount}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">AI</p>
                      <p className="text-sm font-black text-slate-900">{user.geminiScanCount}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">GS1</p>
                      <p className="text-sm font-black text-slate-900">{user.gs1ScanCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>Last Login</span>
                    </div>
                    <span>{user.lastLogin ? format(toDate(user.lastLogin), 'MMM d, HH:mm') : 'Never'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
