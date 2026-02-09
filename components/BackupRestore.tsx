
import React, { useRef, useState } from 'react';
import { 
  Download, 
  Upload, 
  Database, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  FileStack,
} from 'lucide-react';

interface BackupRestoreProps {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface BackupPreview {
  version: string;
  timestamp: string;
  profileCount: number;
  expenseCount: number;
  bankAccountCount: number;
  profileNames: string[];
  rawData: any;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ showToast }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<BackupPreview | null>(null);

  const getFullState = () => {
    const profilesStr = localStorage.getItem('weddingsync_profiles');
    const activeProfileStr = localStorage.getItem('weddingsync_active_profile');
    const expenses: Record<string, any> = {};
    const settings: Record<string, any> = {};
    const bankAccounts: Record<string, any> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (key.startsWith('weddingsync_expenses')) {
          const val = localStorage.getItem(key);
          if (val) expenses[key] = JSON.parse(val);
        } else if (key.startsWith('weddingsync_settings')) {
          const val = localStorage.getItem(key);
          if (val) settings[key] = JSON.parse(val);
        } else if (key.startsWith('weddingsync_bank_accounts')) {
          const val = localStorage.getItem(key);
          if (val) bankAccounts[key] = JSON.parse(val);
        }
      }
    }

    return {
      version: "1.1",
      timestamp: new Date().toISOString(),
      profiles: profilesStr ? JSON.parse(profilesStr) : [],
      activeProfile: activeProfileStr ? JSON.parse(activeProfileStr) : null,
      expenses,
      settings,
      bankAccounts
    };
  };

  const handleExport = () => {
    try {
      const backupData = getFullState();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `WeddingSync_Vault_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Vault exported", "success");
    } catch (err) {
      showToast("Export failed", "error");
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        processPreview(raw);
      } catch (err) {
        showToast("Invalid vault file", "error");
      }
    };
    reader.readAsText(file);
  };

  const processPreview = (data: any) => {
    if (!data.profiles || !data.expenses || !data.settings) {
      showToast("Invalid vault structure", "error");
      return;
    }

    let totalExpenses = 0;
    Object.values(data.expenses).forEach((list: any) => {
      if (Array.isArray(list)) totalExpenses += list.length;
    });

    let totalBankAccounts = 0;
    if (data.bankAccounts) {
      Object.values(data.bankAccounts).forEach((list: any) => {
        if (Array.isArray(list)) totalBankAccounts += list.length;
      });
    }

    setPreview({
      version: data.version || "1.0",
      timestamp: data.timestamp || new Date().toISOString(),
      profileCount: data.profiles.length,
      expenseCount: totalExpenses,
      bankAccountCount: totalBankAccounts,
      profileNames: data.profiles.map((p: any) => p.name),
      rawData: data
    });
  };

  const executeRestore = () => {
    if (!preview) return;
    const data = preview.rawData;

    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('weddingsync_')) keysToDelete.push(k);
      }
      keysToDelete.forEach(k => localStorage.removeItem(k));

      localStorage.setItem('weddingsync_profiles', JSON.stringify(data.profiles));
      const targetActive = data.activeProfile || (data.profiles.length > 0 ? data.profiles[0] : null);
      if (targetActive) localStorage.setItem('weddingsync_active_profile', JSON.stringify(targetActive));
      Object.entries(data.expenses).forEach(([key, val]) => localStorage.setItem(key, JSON.stringify(val)));
      Object.entries(data.settings).forEach(([key, val]) => localStorage.setItem(key, JSON.stringify(val)));
      if (data.bankAccounts) Object.entries(data.bankAccounts).forEach(([key, val]) => localStorage.setItem(key, JSON.stringify(val)));

      showToast("Vault restored", "success");
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      showToast("Restore failed", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-1.5 bg-rose-50 rounded-xl text-rose-500 shadow-sm shrink-0">
             <Database size={16} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Local Backup</h4>
            <p className="text-[7px] text-slate-400 mt-1 leading-tight font-bold uppercase tracking-tight">
              Export/Import JSON vault.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-900 text-white rounded-lg transition-all active:scale-95 group"
          >
              <Download size={12} />
              <span className="text-[7px] font-black uppercase tracking-widest">Export</span>
          </button>
          <label className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-50 border border-slate-100 text-slate-800 rounded-lg transition-all active:scale-95 cursor-pointer">
              <Upload size={12} className="text-rose-500" />
              <span className="text-[7px] font-black uppercase tracking-widest">Import</span>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelection} className="hidden" />
          </label>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <AlertTriangle size={18} />
                  </div>
                  <h3 className="font-black text-slate-900 text-base">Incoming Data</h3>
                </div>
                <button onClick={() => setPreview(null)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Profiles</p>
                        <p className="text-sm font-bold text-slate-800">{preview.profileCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Ledger Items</p>
                        <p className="text-sm font-bold text-slate-800">{preview.expenseCount}</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                        <FileStack size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                  <p className="text-[10px] text-rose-600 font-bold leading-relaxed">
                    Warning: Importing will overwrite this device's data.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button onClick={() => setPreview(null)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest">Cancel</button>
                <button onClick={executeRestore} className="py-4 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Overwrite & Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
