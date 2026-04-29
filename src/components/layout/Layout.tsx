import React from 'react';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Target, TrendingUp, TrendingDown, Layers, BoxSelect, UploadCloud, ChevronRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: 'upload', label: 'Données & Import', icon: UploadCloud },
  { id: 'descriptive', label: 'Analyse Descriptive', icon: LayoutDashboard },
  { id: 'simple-regression', label: 'Régression Simple', icon: TrendingUp },
  { id: 'multi-regression', label: 'Régression Multiple', icon: TrendingDown },
  { id: 'pca', label: 'Réduction (PCA)', icon: Layers },
  { id: 'supervised', label: 'Classification Supervisée', icon: Target },
  { id: 'unsupervised', label: 'Clustering (K-Means)', icon: BoxSelect },
];

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  return (
    <div className="flex h-screen w-full font-sans overflow-hidden glass-body text-slate-50 gap-6 p-6">
      {/* Sidebar */}
      <aside className="w-[260px] glass-panel flex flex-col shrink-0 py-8 px-5">
        <div className="mb-12">
          <h1 className="font-black text-2xl tracking-tighter">MarketAnalyst<span className="text-rose-500">.</span></h1>
          <p className="text-[11px] opacity-60 mt-1">Moteur R 4.2.1 | Online Session</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center justify-between px-[18px] py-[14px] rounded-xl text-sm font-medium transition-all duration-300 group",
                  isActive 
                    ? "bg-white/15 border-l-4 border-slate-50 text-white" 
                    : "text-slate-300 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : "opacity-70 group-hover:text-white group-hover:opacity-100")} />
                  <span>{tab.label}</span>
                </div>
              </button>
            )
          })}
        </nav>
        
        <div className="mt-8">
          <div className="glass-panel p-3 text-xs w-full text-left">
            <p><strong className="font-semibold text-emerald-400">Statut:</strong> Connecté</p>
            <p className="opacity-70 truncate mt-1">Source: market_data_v2.csv</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
