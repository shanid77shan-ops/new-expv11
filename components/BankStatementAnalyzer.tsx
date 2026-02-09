
import React, { useState, useMemo, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Landmark, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileJson, 
  Plus, 
  ChevronRight, 
  Trash2, 
  ArrowLeft,
  History,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  BarChart3,
  Wallet,
  Clock,
  CalendarDays,
  FileDown
} from 'lucide-react';
import { BankAnalysisResult, BankAccount } from '../types';

interface BankStatementAnalyzerProps {
  activeProfileId: string;
  accounts: BankAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
}

export const BankStatementAnalyzer: React.FC<BankStatementAnalyzerProps> = ({ 
  activeProfileId,
  accounts,
  setAccounts
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<BankAnalysisResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const convertInputRef = useRef<HTMLInputElement>(null);

  const activeAccount = accounts.find(a => a.id === selectedAccountId);

  const globalReport = useMemo(() => {
    const analyzedAccounts = accounts.filter(acc => acc.lastAnalysis);
    return analyzedAccounts.reduce((acc, current) => {
      const analysis = current.lastAnalysis!;
      return {
        totalBalance: acc.totalBalance + analysis.closingBalance,
        totalCredits: acc.totalCredits + analysis.totalCredits,
        totalDebits: acc.totalDebits + analysis.totalDebits,
        accountCount: acc.accountCount + 1
      };
    }, { totalBalance: 0, totalCredits: 0, totalDebits: 0, accountCount: 0 });
  }, [accounts]);

  const addAccount = () => {
    if (!newAccountName.trim()) return;
    const newAcc: BankAccount = {
      id: `bank_${Date.now()}`,
      name: newAccountName.trim(),
      updatedAt: new Date().toISOString()
    };
    setAccounts([...accounts, newAcc]);
    setNewAccountName("");
    setIsAddingAccount(false);
    setSelectedAccountId(newAcc.id);
  };

  const deleteAccount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Remove this bank account and its history for this profile?")) {
      setAccounts(accounts.filter(a => a.id !== id));
      if (selectedAccountId === id) setSelectedAccountId(null);
    }
  };

  const convertPdfToTxt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setLoadingStep("Extracting Text...");
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject(new Error("File reading failed"));
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { inlineData: { mimeType: 'application/pdf', data: base64Data } },
              { text: "Extract all text content from this bank statement. Maintain the reading order and layout as much as possible in plain text. Do not include any analysis, just the raw extracted text." }
            ],
          },
        ],
      });

      const extractedText = response.text;
      if (extractedText) {
        const blob = new Blob([extractedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file.name.replace('.pdf', '')}_extracted.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error(err);
      setError("Text extraction failed. Ensure the PDF is not password protected.");
    } finally {
      setLoading(false);
      setLoadingStep("");
      if (e.target) e.target.value = '';
    }
  };

  const analyzeBankStatement = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAccountId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setLoadingStep("Reading document...");
    setError(null);
    setPreviewResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      let contentPart: any;

      if (fileType.includes('text') || fileName.endsWith('.json') || fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        const textPromise = new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("File reading failed"));
          reader.readAsText(file);
        });
        const fileContent = await textPromise;
        contentPart = { text: `File Content (${fileName}):\n\n${fileContent}` };
      } else {
        const base64Promise = new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = () => reject(new Error("File reading failed"));
          reader.readAsDataURL(file);
        });
        const base64Data = await base64Promise;
        const mime = fileName.endsWith('.pdf') ? 'application/pdf' : (fileType || 'application/octet-stream');
        contentPart = { inlineData: { mimeType: mime, data: base64Data } };
      }

      setLoadingStep("AI Auditing...");
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              contentPart,
              {
                text: "Analyze the attached bank statement or transaction export. Extract: total debits (outgoing), total credits (incoming), opening balance, closing balance, and specifically identify transactions from the last 24 hours of the statement period. If no transactions exist within that 24-hour window, provide the 5 most recent transactions from the end of the statement. Return valid JSON only.",
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalDebits: { type: Type.NUMBER },
              totalCredits: { type: Type.NUMBER },
              openingBalance: { type: Type.NUMBER },
              closingBalance: { type: Type.NUMBER },
              statementPeriod: { type: Type.STRING },
              topTransactions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    description: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    type: { type: Type.STRING, description: "either 'debit' or 'credit'" }
                  }
                }
              }
            },
            required: ["totalDebits", "totalCredits", "openingBalance", "closingBalance", "topTransactions"]
          }
        }
      });

      setLoadingStep("Finalizing...");
      const text = response.text;
      if (text) {
        const result: BankAnalysisResult = JSON.parse(text);
        setPreviewResult(result);
      } else {
        throw new Error("The AI returned an empty response.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analysis failed.");
    } finally {
      setLoading(false);
      setLoadingStep("");
      if (e.target) e.target.value = '';
    }
  };

  const confirmAnalysis = () => {
    if (!previewResult || !selectedAccountId) return;
    setAccounts(prev => prev.map(acc => 
      acc.id === selectedAccountId 
        ? { ...acc, lastAnalysis: previewResult, updatedAt: new Date().toISOString() } 
        : acc
    ));
    setPreviewResult(null);
    setError(null);
  };

  if (!selectedAccountId) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {globalReport.accountCount > 0 && (
          <div className="bg-slate-900 rounded-[2.5rem] p-4 shadow-xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 opacity-60">
                <BarChart3 size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Global Wealth</span>
              </div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">${globalReport.totalBalance.toLocaleString()}</h2>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{globalReport.accountCount} Accounts Linked</p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                  <Wallet size={20} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Credits</p>
                  <p className="text-xs font-black text-emerald-400">+${globalReport.totalCredits.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Debits</p>
                  <p className="text-xs font-black text-rose-400">-${globalReport.totalDebits.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-900 rounded-2xl shadow-sm">
                <Landmark size={18} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900">Bank Accounts</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Linked Storage</p>
              </div>
            </div>
            <button onClick={() => setIsAddingAccount(true)} className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Plus size={18} />
            </button>
          </div>

          {isAddingAccount && (
            <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-top-2">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Name</p>
              <div className="flex gap-2">
                <input autoFocus type="text" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="Checking..." className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold outline-none" onKeyPress={(e) => e.key === 'Enter' && addAccount()} />
                <button onClick={addAccount} className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">Add</button>
                <button onClick={() => setIsAddingAccount(false)} className="bg-white border border-slate-200 text-slate-400 px-2.5 py-1.5 rounded-xl"><Plus className="rotate-45" size={16} /></button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {accounts.length === 0 ? (
              <div className="text-center py-8 opacity-40">
                <History size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-[10px] font-bold text-slate-400">No linked bank accounts.</p>
              </div>
            ) : (
              accounts.map(acc => (
                <div key={acc.id} onClick={() => setSelectedAccountId(acc.id)} className="group bg-slate-50 border border-slate-50 p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white hover:shadow-md hover:border-rose-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-rose-500 shadow-sm">
                      <Landmark size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{acc.name}</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{acc.lastAnalysis ? `Audit: ${new Date(acc.updatedAt!).toLocaleDateString()}` : "No history"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {acc.lastAnalysis && <p className="text-xs font-black text-slate-900">${acc.lastAnalysis.closingBalance.toLocaleString()}</p>}
                    <button onClick={(e) => deleteAccount(acc.id, e)} className="p-1.5 text-slate-300 hover:text-black opacity-0 group-hover:opacity-100 transition-colors"><Trash2 size={14} /></button>
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
      <div className="flex items-center justify-between px-1">
        <button onClick={() => { setSelectedAccountId(null); setError(null); setPreviewResult(null); }} className="flex items-center gap-2 text-slate-400"><ArrowLeft size={16} /><span className="text-[9px] font-black uppercase tracking-widest">Accounts</span></button>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100">
          <Landmark size={10} className="text-rose-500" />
          <span className="text-[9px] font-black text-slate-900 truncate max-w-[120px]">{activeAccount?.name}</span>
        </div>
      </div>

      {activeAccount?.lastAnalysis && !previewResult && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg"><Clock size={14} /></div>
                <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Recent Activity</h4>
              </div>
              <span className="bg-slate-50 text-slate-400 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Real-time</span>
            </div>
            <div className="space-y-2">
              {activeAccount.lastAnalysis.topTransactions.length > 0 ? (
                activeAccount.lastAnalysis.topTransactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>{tx.type === 'credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}</div>
                      <div className="max-w-[150px]"><p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{tx.description}</p><p className="text-[8px] font-bold text-slate-400 uppercase">{tx.date}</p></div>
                    </div>
                    <p className={`text-[11px] font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>{tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}</p>
                  </div>
                ))
              ) : <p className="text-[9px] text-slate-400 italic text-center py-2">No recent activity detected.</p>}
            </div>
          </div>
          <div className="bg-slate-900 text-white p-4 rounded-[2.5rem] shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6"></div>
             <div className="flex justify-between items-end mb-3 relative z-10"><div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Live Balance</p><p className="text-2xl font-black">${activeAccount.lastAnalysis.closingBalance.toLocaleString()}</p></div><div className="text-right"><p className="text-[8px] font-bold text-slate-300">Audit: {new Date(activeAccount.updatedAt!).toLocaleDateString()}</p></div></div>
             <div className="h-1 bg-slate-800 rounded-full overflow-hidden relative z-10"><div className="h-full bg-emerald-400 transition-all duration-1000 shadow-[0_0_8px_rgba(52,211,153,0.5)]" style={{ width: `${Math.min((activeAccount.lastAnalysis.totalCredits / (activeAccount.lastAnalysis.totalCredits + activeAccount.lastAnalysis.totalDebits)) * 100 || 0, 100)}%` }} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl"><div className="flex items-center gap-1.5 text-emerald-600 mb-0.5"><ArrowDownLeft size={12} /><span className="text-[8px] font-black uppercase tracking-widest">Inflow</span></div><p className="text-lg font-black text-emerald-900">${activeAccount.lastAnalysis.totalCredits.toLocaleString()}</p></div>
            <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-2xl"><div className="flex items-center gap-1.5 text-rose-600 mb-0.5"><ArrowUpRight size={12} /><span className="text-[8px] font-black uppercase tracking-widest">Outflow</span></div><p className="text-lg font-black text-rose-900">${activeAccount.lastAnalysis.totalDebits.toLocaleString()}</p></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-5"><div className="p-2.5 bg-blue-600 text-white rounded-2xl"><Sparkles size={16} /></div><div><h3 className="text-xs font-black text-slate-900">Sync & Export</h3><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Gemini AI Document Lab</p></div></div>
        <div className="grid grid-cols-1 gap-3">
          <label className={`flex flex-col items-center justify-center w-full min-h-[110px] border-2 border-dashed rounded-[2rem] transition-all relative overflow-hidden ${loading ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 bg-slate-50/50 cursor-pointer active:scale-[0.99]'}`}>
            <div className="flex flex-col items-center justify-center px-4 text-center z-10 py-4">{loading ? (<div className="flex flex-col items-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" /><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">{loadingStep}</p></div>) : (<><div className="flex gap-2 mb-2"><div className="p-2 bg-white rounded-xl shadow-sm text-slate-400"><FileJson size={18} /></div><div className="p-2 bg-white rounded-xl shadow-sm text-slate-400"><FileText size={18} /></div></div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sync Statement (Audit Balance)</p></>)}</div>
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.json,.csv,.txt,image/*" onChange={analyzeBankStatement} disabled={loading} />
          </label>
          {!loading && (<button onClick={() => convertInputRef.current?.click()} className="w-full py-3 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center gap-3 hover:bg-slate-800"><div className="p-1.5 bg-white/10 rounded-lg"><FileDown size={18} /></div><span className="text-[10px] font-black uppercase tracking-widest">Convert PDF to TXT</span><input ref={convertInputRef} type="file" className="hidden" accept=".pdf" onChange={convertPdfToTxt} /></button>)}
        </div>
        {error && (<div className="mt-3 p-3 bg-rose-50 rounded-xl flex items-start gap-2 border border-rose-100 animate-in shake"><AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" /><span className="text-[10px] font-bold text-rose-600 leading-tight">{error}</span></div>)}
      </div>

      {previewResult && (
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500 pb-4">
          <div className="flex items-center gap-2 px-1"><div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><ShieldCheck size={12} /></div><h4 className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Audit Preview</h4></div>
          <div className="bg-white rounded-[2rem] border border-amber-100 p-5 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-2 gap-3 mb-5 relative"><div className="space-y-0.5"><p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Inflow</p><p className="text-base font-black text-emerald-600">+${previewResult.totalCredits.toLocaleString()}</p></div><div className="space-y-0.5"><p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Outflow</p><p className="text-base font-black text-rose-500">-${previewResult.totalDebits.toLocaleString()}</p></div><div className="col-span-2 pt-3 border-t border-slate-50"><p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Closing Balance</p><p className="text-2xl font-black text-slate-900">${previewResult.closingBalance.toLocaleString()}</p></div></div>
            <div className="space-y-2 mb-6"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><CalendarDays size={10} /> Transactions Detected</p>
              {previewResult.topTransactions.map((tx, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 rounded-lg p-2"><div className="flex items-center gap-2"><span className={`w-1 h-1 rounded-full ${tx.type === 'credit' ? 'bg-emerald-400' : 'bg-rose-400'}`} /><p className="text-[9px] font-bold text-slate-700 truncate max-w-[120px]">{tx.description}</p></div><p className={`text-[9px] font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>{tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}</p></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2"><button onClick={() => setPreviewResult(null)} className="py-3 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase">Discard</button><button onClick={confirmAnalysis} className="py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2"><CheckCircle2 size={12} /> Confirm & Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
