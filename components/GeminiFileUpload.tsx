import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { FileText, Loader2, Sparkles, AlertCircle, PlusCircle, CheckCircle2 } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../constants';
import { AIAnalysisResult } from '../types';

interface GeminiFileUploadProps {
  onConfirm: (data: AIAnalysisResult) => void;
}

const GeminiFileUpload: React.FC<GeminiFileUploadProps> = ({ onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size === 0) {
      setError("The selected file appears to be empty.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject(new Error("Failed to read file"));
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: file.type || "application/octet-stream",
                  data: base64Data,
                },
              },
              {
                text: `You are a professional wedding budget analyst. Analyze this wedding receipt or invoice. 
                Extract the following details precisely:
                1. Vendor/Merchant Name
                2. A category from this list: [${DEFAULT_CATEGORIES.join(', ')}]
                3. The date in YYYY-MM-DD format
                4. The total amount paid as a number.
                
                If the document is a PDF, ensure you check all visible pages for the final total.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vendor: { type: Type.STRING },
              category: { type: Type.STRING },
              date: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER, description: "0 to 1 value of accuracy" }
            },
            required: ["vendor", "category", "date", "amount"]
          }
        }
      });

      const text = response.text;
      if (text) {
        setResult(JSON.parse(text));
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "Failed to analyze document";
      if (msg.includes("no pages") || msg.includes("INVALID_ARGUMENT") || msg.includes("Proxy")) {
        msg = "Unsupported format or proxy error. Please try a clear photo or CSV.";
      }
      setError(msg);
    } finally {
      setLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-3xl transition-all ${loading ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200 bg-white cursor-pointer hover:border-indigo-400 hover:bg-slate-50 active:scale-[0.99]'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            {loading ? (
              <>
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Syncing with Gemini...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3 shadow-sm">
                  <Sparkles size={24} />
                </div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Upload Invoice</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">PDF, JPG, or PNG supported</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,image/*" 
            onChange={analyzeFile} 
            disabled={loading}
          />
        </label>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-rose-700 leading-relaxed uppercase tracking-tight">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-[2rem] border border-indigo-100 p-6 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <CheckCircle2 size={14} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Results</h4>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Vendor Identified</p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-black text-slate-800">
                  {result.vendor}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Category</p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black text-indigo-600 uppercase">
                  {result.category}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Total Amount</p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-sm font-black text-emerald-700">
                  ${result.amount.toLocaleString()}
                </div>
              </div>
            </div>

            <button 
              onClick={() => onConfirm(result)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              <PlusCircle size={16} /> Sync to Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiFileUpload;