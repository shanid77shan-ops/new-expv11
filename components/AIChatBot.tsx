
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { X, Send, Sparkles, User, Bot, Loader2, MessageSquare } from 'lucide-react';
import { Expense, AccountData, BankAccount } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  dataContext: {
    expenses: Expense[];
    totals: any;
    accounts: string[]; // Budget sources
    bankAccounts: BankAccount[];
    accountReport: Record<string, AccountData>;
  };
  onModifyBudget?: (accountName: string, delta: number, targetType: 'budget' | 'bank') => string;
  onAddTransaction?: (name: string, amount: number, accountName: string, targetType: 'budget' | 'bank') => string;
}

export const AIChatBot: React.FC<AIChatBotProps> = ({ 
  isOpen, 
  onClose, 
  dataContext,
  onModifyBudget,
  onAddTransaction,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Butler at your service. I can manage your budget or analyze bank records!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  // Tool Definitions with Target Selection
  const modifyAccountBudgetDeclaration: FunctionDeclaration = {
    name: 'modifyAccountBudget',
    parameters: {
      type: Type.OBJECT,
      description: 'Modify the balance or limit for a specific account. You MUST choose the correct targetType.',
      properties: {
        accountName: {
          type: Type.STRING,
          description: 'The name of the account to modify.'
        },
        delta: {
          type: Type.NUMBER,
          description: 'The amount to add or subtract.'
        },
        targetType: {
          type: Type.STRING,
          enum: ['budget', 'bank'],
          description: "Use 'bank' ONLY if the name matches a Bank Account in the Bank Section. Use 'budget' for sources in Settings/Ledger."
        }
      },
      required: ['accountName', 'delta', 'targetType'],
    },
  };

  const quickAddTransactionDeclaration: FunctionDeclaration = {
    name: 'quickAddTransaction',
    parameters: {
      type: Type.OBJECT,
      description: 'Record a transaction. If the user "received" money, use targetType "budget" to increase the master budget.',
      properties: {
        name: {
          type: Type.STRING,
          description: 'Description of the transaction (e.g., "Paid for flowers" or "Received gift").'
        },
        amount: {
          type: Type.NUMBER,
          description: 'The amount.'
        },
        accountName: {
          type: Type.STRING,
          description: 'The account name to use.'
        },
        targetType: {
          type: Type.STRING,
          enum: ['budget', 'bank'],
          description: "Use 'bank' ONLY if the name matches a Bank Account in the Bank Section. Use 'budget' for sources in Settings/Ledger."
        }
      },
      required: ['name', 'amount', 'accountName', 'targetType'],
    },
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const dataSnapshot = {
        budgetSources: dataContext.accounts,
        bankAccounts: dataContext.bankAccounts.map(b => b.name),
        summary: {
          totalBudget: dataContext.totals.totalMasterBudget,
          totalSpent: dataContext.totals.totalPaid,
          availableBalance: dataContext.totals.balanceAvailable
        }
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{
              text: `You are a surgical wedding financial assistant.
              
              CONTEXT:
              - Budget Sources (Settings/Ledger): [${dataSnapshot.budgetSources.join(', ')}]
              - Bank Accounts (Bank Section): [${dataSnapshot.bankAccounts.join(', ')}]
              - Summary: Budget=$${dataSnapshot.summary.totalBudget}, Spent=$${dataSnapshot.summary.totalSpent}, Balance=$${dataSnapshot.summary.availableBalance}
              
              RULES FOR TRANSACTIONS:
              1. IF USER "RECEIVED" MONEY (Income/Gift):
                 - Use targetType 'budget'. This INCREASES the Total Budget and Balance.
              2. IF USER "SPENT" MONEY (Expense/Payment):
                 - Use targetType 'budget' for Ledger tracking. This INCREASES Total Spent and DECREASES Balance.
              3. IF KEYWORD matches "Bank Accounts" list, use targetType 'bank' (Isolated to Bank Section).
              
              User request: "${userMessage}"`
            }]
          }
        ],
        config: {
          temperature: 0.7,
          topP: 0.95,
          tools: [{
            functionDeclarations: [
              modifyAccountBudgetDeclaration,
              quickAddTransactionDeclaration
            ]
          }]
        }
      });

      let aiText = response.text || "Butler action complete.";
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        let actionSummaries = [];
        
        for (const fc of response.functionCalls) {
          if (fc.name === 'modifyAccountBudget' && onModifyBudget) {
            const { accountName, delta, targetType } = fc.args as any;
            onModifyBudget(accountName, delta, targetType);
            actionSummaries.push(`⚡ ${targetType === 'bank' ? 'Bank' : 'Budget'} adjusted: ${accountName} (${delta > 0 ? '+' : ''}${delta}).`);
          }
          
          if (fc.name === 'quickAddTransaction' && onAddTransaction) {
            const { name, amount, accountName, targetType } = fc.args as any;
            onAddTransaction(name, amount, accountName, targetType);
            const isIncome = name.toLowerCase().includes('receive') || name.toLowerCase().includes('gift') || name.toLowerCase().includes('income');
            actionSummaries.push(`⚡ ${targetType === 'bank' ? 'Bank' : isIncome ? 'Income' : 'Ledger'} update: "${name}" for $${amount} via ${accountName}.`);
          }
        }
        
        if (actionSummaries.length > 0) {
          aiText = actionSummaries.join('\n') + '\n\n' + (aiText === "Butler action complete." ? "" : aiText);
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: aiText.trim() }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Service paused. Please verify your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-[90vh] sm:h-[600px] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20"><Sparkles size={20} /></div>
            <div><h3 className="text-sm font-black uppercase tracking-widest">Isolated Butler IQ</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Budget vs Bank Targeted Controls</p></div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><X size={20} /></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-3xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-1 opacity-60 text-[8px] font-black uppercase tracking-widest">{msg.role === 'user' ? 'You' : 'Assistant'}</div>
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (<div className="flex justify-start"><div className="bg-white border border-slate-100 rounded-3xl rounded-tl-none p-4 flex items-center gap-3"><Loader2 className="w-4 h-4 text-indigo-500 animate-spin" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Targeting Update...</span></div></div>)}
        </div>
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSend} className="relative">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-4 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" />
            <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center active:scale-90 disabled:opacity-30 transition-all shadow-lg"><Send size={18} /></button>
          </form>
        </div>
      </div>
    </div>
  );
};
