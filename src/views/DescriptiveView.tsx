import React, { useMemo } from 'react';
import { RCodeBlock } from '../components/ui/RCodeBlock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface DescriptiveProps {
  data: any[];
  columns: string[];
}

export function DescriptiveView({ data, columns }: DescriptiveProps) {
  // Find numeric columns
  const numericCols = useMemo(() => {
    if (!data.length) return [];
    return columns.filter(col => typeof data[0][col] === 'number');
  }, [data, columns]);

  const stats = useMemo(() => {
    return numericCols.map(col => {
      const values = data.map(d => d[col]).filter(v => typeof v === 'number' && !isNaN(v));
      if (values.length === 0) return null;
      
      const min = Math.min(...values);
      const max = Math.max(...values);
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      
      // Variance and SD
      const diffSq = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0);
      const sd = Math.sqrt(diffSq / (values.length - 1 || 1));
      
      return {
        col,
        min: min.toFixed(2),
        max: max.toFixed(2),
        mean: mean.toFixed(2),
        sd: sd.toFixed(2),
      };
    }).filter(Boolean);
  }, [data, numericCols]);

  const rCode = `
# --------------- TP INF232 : Analyse Descriptive ---------------

# 1. Résumé statistique complet de toutes les variables
summary(market_data)

# 2. Informations détaillées sur un vecteur spécifique (ex: Moyenne, Ecart-type)
mean(market_data$Sales, na.rm=TRUE)
sd(market_data$Sales, na.rm=TRUE)

# 3. Visualisations basiques
# Histogramme
hist(market_data$Sales, 
     main="Distribution des Ventes", 
     xlab="Ventes", col="#3b82f6", border="white")

# Diagramme en boîte (Boxplot) pour identifier les valeurs atypiques
boxplot(market_data$Ad_Spend, 
        main="Boxplot des dépenses publicitaires", 
        ylab="Dépenses", col="#10b981")
  `;

  return (
    <div className="space-y-8 text-slate-50">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Analyse Descriptive</h2>
        <p className="text-slate-300">
          Statistiques sommaires pour la collecte et la compréhension initiale des données.
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-panel p-5">
            <h3 className="text-lg font-semibold mb-4 text-white">Statistiques principales</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-300 bg-white/10 uppercase border-b border-white/10 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3 font-medium">Variable</th>
                    <th className="px-4 py-3 font-medium">Moyenne</th>
                    <th className="px-4 py-3 font-medium">Min</th>
                    <th className="px-4 py-3 font-medium">Max</th>
                    <th className="px-4 py-3 font-medium">Ecart-Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {stats.map((stat: any) => (
                    <tr key={stat.col} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-2 font-medium text-white">{stat.col}</td>
                      <td className="px-4 py-2 text-slate-200">{stat.mean}</td>
                      <td className="px-4 py-2 text-slate-200">{stat.min}</td>
                      <td className="px-4 py-2 text-slate-200">{stat.max}</td>
                      <td className="px-4 py-2 text-slate-400">{stat.sd}</td>
                    </tr>
                  ))}
                  {stats.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">Aucune colonne numérique trouvée</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel p-5">
            <h3 className="text-lg font-semibold mb-4 text-white">Histogramme générique (1ère variable num)</h3>
            <div className="h-[250px] w-full">
               {numericCols.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.slice(0, 15)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={columns[0]} tick={{fontSize: 12, fill: '#f8fafc'}} />
                    <YAxis tick={{fontSize: 12, fill: '#f8fafc'}} />
                    <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff'}} />
                    <Bar dataKey={numericCols[0]} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                   Pas de données visuelles
                 </div>
               )}
            </div>
          </div>
        </div>

        <div>
          <RCodeBlock code={rCode} className="h-full" />
        </div>
      </div>
    </div>
  );
}
