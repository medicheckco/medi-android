import { motion } from 'motion/react';
import { Download, Upload, FileJson, FileSpreadsheet, AlertCircle, ArrowLeft, Database } from 'lucide-react';

interface ImportExportPageProps {
  onBack: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
}

export function ImportExportPage({
  onBack,
  onImportClick,
  onExportClick
}: ImportExportPageProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-10 space-y-4 sm:space-y-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[11px] sm:text-sm font-black uppercase tracking-widest">Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-600/20 shrink-0">
            <Database className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">Import & Export</h2>
            <p className="text-[10px] sm:text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">Data Management</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-8">
        <div className="p-4 sm:p-8 bg-blue-50/50 rounded-2xl sm:rounded-[2rem] border border-blue-100/50 flex gap-3 sm:gap-6 items-start">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-[11px] sm:text-sm font-black text-blue-900 uppercase tracking-wider mb-1">Quick Tip</h4>
            <p className="text-[11px] sm:text-sm font-bold text-blue-700/80 leading-relaxed max-w-2xl">
              Use CSV files for bulk imports. The system automatically links batches to medications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8">
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onImportClick}
            className="w-full p-4 sm:p-10 bg-white hover:bg-slate-50 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 transition-all group text-left flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-6 shadow-sm shadow-slate-200/50"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0 border border-blue-100">
              <Download className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-xl font-black text-slate-900">Bulk Import Data</h3>
              <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-0.5">Upload CSV</p>
              <div className="hidden sm:flex items-center gap-3 mt-6 p-4 bg-slate-50 rounded-2xl">
                <FileSpreadsheet className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter">Supports standard .CSV formats</span>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportClick}
            className="w-full p-4 sm:p-10 bg-white hover:bg-slate-50 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 transition-all group text-left flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-6 shadow-sm shadow-slate-200/50"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0 border border-emerald-100">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-xl font-black text-slate-900">Export All Data</h3>
              <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-0.5">Download database</p>
              <div className="hidden sm:flex items-center gap-3 mt-6 p-4 bg-slate-50 rounded-2xl">
                <FileJson className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter">Formatted as high-fidelity .CSV</span>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

