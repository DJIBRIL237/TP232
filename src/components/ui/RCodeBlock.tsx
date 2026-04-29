import React, { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RCodeBlockProps {
  code: string;
  title?: string;
  className?: string;
}

export function RCodeBlock({ code, title = "Script R généré pour le TP", className }: RCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className={cn("glass-panel overflow-hidden flex flex-col", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-slate-200">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium tracking-wide">{title}</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 transition-colors text-xs font-medium border border-white/10"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copié</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copier</>
          )}
        </button>
      </div>
      <div className="p-4 overflow-auto text-sm flex-1 custom-scrollbar" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <pre className="text-emerald-200/90 font-mono leading-relaxed tracking-wider text-[13px]">
          <code className="language-r">{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
}
