import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, Upload, CheckCircle2, AlertCircle, FileText, Trash2, Download } from 'lucide-react';
import Papa from 'papaparse';
import { cn } from '../lib/utils';

export const BulkImportModal = ({ onImport, onClose }: { onImport: (data: any[], onProgress?: any) => Promise<any>, onClose: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Progress & Reporting states
  const [stats, setStats] = useState<{ current: number, total: number, success: number, fail: number, lastError?: string } | null>(null);
  const [detailedReport, setDetailedReport] = useState<{ success: number, fail: number, errors: string[] } | null>(null);

  const processFile = (selectedFile: File) => {
    const isCSV = selectedFile.name.toLowerCase().endsWith('.csv') || 
                  selectedFile.type === 'text/csv' || 
                  selectedFile.type === 'application/vnd.ms-excel';
    
    if (!isCSV) {
      setError('Please upload a CSV file');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setStats(null);
    setDetailedReport(null);
    
    Papa.parse(selectedFile, {
      header: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5));
      },
      error: (err) => {
        setError('Failed to parse CSV: ' + err.message);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleImport = async () => {
    if (!file || isProcessing) return;
    setIsProcessing(true);
    setDetailedReport(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const report = await onImport(results.data, (p: any) => {
            setStats(p);
          });
          setDetailedReport(report);
        } catch (err: any) {
          setError('Import failed: ' + (err.message || String(err)));
        } finally {
          setIsProcessing(false);
        }
      },
      error: (err) => {
        setError('Import failed to start: ' + err.message);
        setIsProcessing(false);
      }
    });
  };

  const downloadTemplate = () => {
    const headers = ['Item Code', 'Barcode', 'Medication Name', 'GTIN', 'Brand Name', 'Location', 'Supplier', 'Batch Number', 'Expiry Date (DD-MM-YYYY)', 'Quantity'];
    const csvContent = "data:text/csv;charset=utf-8," + headers.map(h => `"${h}"`).join(',');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "medistock_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-xl flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Bulk Import</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Import medications and batches from CSV</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6 custom-scrollbar bg-gradient-to-b from-white to-slate-50/50">
          {detailedReport ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-emerald-100 shadow-sm shadow-emerald-50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Success</p>
                  <p className="text-3xl font-black text-slate-900">{detailedReport.success}</p>
                </div>
                <div className="p-5 bg-white rounded-3xl border border-rose-100 shadow-sm shadow-rose-50 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                    <AlertCircle className="w-12 h-12 text-rose-500" />
                  </div>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Failed</p>
                  <p className="text-3xl font-black text-slate-900">{detailedReport.fail}</p>
                </div>
              </div>

              {detailedReport.errors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Detailed Logs ({detailedReport.errors.length})</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                    {detailedReport.errors.map((err, i) => (
                      <div key={`import-error-${i}-${err.substring(0, 20)}`} className="flex gap-2 text-[11px] font-bold text-rose-600">
                        <span className="shrink-0">•</span>
                        <p>{err}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs font-bold text-blue-700">Import finalized. You can now close this window safely.</p>
              </div>
            </div>
          ) : stats ? (
            <div className="py-12 space-y-10 text-center animate-in fade-in duration-300">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 60}
                    initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 60) * (1 - stats.current / stats.total) }}
                    className="text-blue-600"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-black text-slate-900">{Math.round((stats.current / stats.total) * 100)}%</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Syncing</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rows</p>
                  <p className="text-xl font-black text-slate-900">{stats.current}/{stats.total}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Ok</p>
                  <p className="text-xl font-black text-emerald-600">{stats.success}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Error</p>
                  <p className="text-xl font-black text-rose-600">{stats.fail}</p>
                </div>
              </div>

              {stats.lastError && (
                <p className="text-[10px] font-bold text-rose-400 italic bg-rose-50/50 py-2 px-4 rounded-full mx-auto inline-block border border-rose-100/50">
                  Skipping: {stats.lastError}
                </p>
              )}
            </div>
          ) : !file ? (
            <div className="space-y-4">
              <div 
                className={cn(
                  "border-2 border-dashed rounded-[1.5rem] p-8 sm:p-10 text-center transition-all cursor-pointer group relative bg-gradient-to-br from-white",
                  isDragging 
                    ? "border-blue-500 bg-blue-50/50 scale-[1.02]" 
                    : "border-blue-100 to-blue-50/20 hover:border-blue-300 hover:bg-blue-50/50"
                )}
                onClick={() => document.getElementById('csv-upload')?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  id="csv-upload"
                  type="file" 
                  accept=".csv,text/csv,application/vnd.ms-excel" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all shadow-sm border border-blue-50">
                  <Upload className="w-7 h-7 text-blue-400 group-hover:text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Drop your CSV here</h4>
                <p className="text-xs text-slate-500 font-medium">or click to browse your files</p>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 flex items-center justify-between border border-blue-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-indigo-100">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Need a template?</p>
                    <p className="text-[10px] text-slate-500 font-medium">Download our pre-formatted CSV</p>
                  </div>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Template
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[150px]">{file.name}</p>
                    <p className="text-[10px] text-blue-100 font-medium">{(file.size / 1024).toFixed(1) || '0'} KB • Ready</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setPreview([]); }}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Data Preview</h4>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {preview[0] && Object.keys(preview[0]).map((header, idx) => (
                            <th key={`${header}-${idx}`} className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={`preview-row-${i}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={`preview-cell-${i}-${j}`} className="px-4 py-3 text-[10px] font-bold text-slate-600 whitespace-nowrap">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 shrink-0">
          {detailedReport ? (
            <button
              onClick={onClose}
              className="w-full py-3 sm:py-4 bg-slate-900 text-white rounded-xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-widest"
            >
              Finish & Close
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={!file || isProcessing}
              className={cn(
                "w-full py-3 sm:py-4 bg-slate-900 text-white rounded-xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-xs sm:text-sm",
                isProcessing && "bg-blue-600 shadow-blue-100"
              )}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Synchronizing {stats?.current || 0} / {stats?.total || 0}...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Start Bulk Import
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
