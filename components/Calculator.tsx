import React, { useState } from 'react';
import { X, Delete, Divide, Minus, Plus, X as Multiply, Equal, RefreshCcw } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldReset, setShouldReset] = useState(false);

  if (!isOpen) return null;

  const handleNumber = (num: string) => {
    if (display === '0' || shouldReset) {
      setDisplay(num);
      setShouldReset(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    // If we're already in the middle of a reset (just clicked an operator)
    // and click another operator, we just update the operator in the equation
    if (shouldReset && equation !== '') {
      const parts = equation.trim().split(' ');
      if (parts.length >= 1) {
        setEquation(parts[0] + ' ' + op + ' ');
      }
      return;
    }

    // If an equation already exists, perform an intermediate calculation (Chaining)
    if (equation !== '') {
      try {
        // Use a safe calculation method or eval carefully for this simple tool
        const result = eval(equation + display);
        const resultStr = String(Number(result.toFixed(2)));
        setDisplay(resultStr);
        setEquation(resultStr + ' ' + op + ' ');
      } catch (e) {
        setDisplay('Error');
        setEquation('');
      }
    } else {
      // First operator in the sequence
      setEquation(display + ' ' + op + ' ');
    }
    setShouldReset(true);
  };

  const calculate = () => {
    if (!equation) return;
    try {
      const result = eval(equation + display);
      setDisplay(String(Number(result.toFixed(2))));
      setEquation('');
      setShouldReset(true);
    } catch (e) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setShouldReset(false);
  };

  const backspace = () => {
    if (shouldReset) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const Button = ({ children, onClick, className = "", variant = "default" }: any) => {
    const variants: any = {
      default: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      operator: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
      action: "bg-rose-500 text-white hover:bg-rose-600",
      util: "bg-slate-200 text-slate-600 hover:bg-slate-300"
    };
    return (
      <button 
        onClick={onClick}
        className={`h-14 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[320px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        {/* Display Area */}
        <div className="bg-slate-900 p-6 text-right">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quick Calc</span>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="h-4 text-[10px] font-bold text-slate-500 uppercase mb-1 overflow-hidden truncate">
            {equation}
          </div>
          <div className="text-3xl font-black text-white truncate tracking-tighter">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="p-4 grid grid-cols-4 gap-2">
          <Button variant="util" onClick={clear}>C</Button>
          <Button variant="util" onClick={backspace}><Delete size={18} /></Button>
          <Button variant="util" onClick={() => handleOperator('%')}>%</Button>
          <Button variant="operator" onClick={() => handleOperator('/')}><Divide size={18} /></Button>

          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button variant="operator" onClick={() => handleOperator('*')}><Multiply size={18} /></Button>

          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button variant="operator" onClick={() => handleOperator('-')}><Minus size={18} /></Button>

          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button variant="operator" onClick={() => handleOperator('+')}><Plus size={18} /></Button>

          <Button onClick={() => handleNumber('0')} className="col-span-2">0</Button>
          <Button onClick={() => handleNumber('.')}>.</Button>
          <Button variant="action" onClick={calculate}><Equal size={20} /></Button>
        </div>
        
        <div className="bg-slate-50 py-3 px-6 flex justify-center">
          <button 
            onClick={() => { setDisplay('0'); setEquation(''); }}
            className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            <RefreshCcw size={10} /> Reset Session
          </button>
        </div>
      </div>
    </div>
  );
};