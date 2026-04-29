import React, { useState, useMemo } from 'react';
import { RCodeBlock } from '../components/ui/RCodeBlock';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function SupervisedView({ data, columns }: { data: any[], columns: string[] }) {
  const [targetCol, setTargetCol] = useState(columns.includes('Success') ? 'Success' : columns[columns.length - 1]);
  
  // Try to find two numeric predictor columns for 2D visualization
  const numericCols = columns.filter(col => typeof data[0][col] === 'number' && col !== targetCol);
  const [xCol, setXCol] = useState(numericCols[0] || '');
  const [yCol, setYCol] = useState(numericCols[1] || numericCols[0] || '');

  const plotData = useMemo(() => {
    if (!xCol || !yCol || !targetCol || data.length === 0) return [];
    
    // Check if target is discrete (classification)
    const uniqueTargets = Array.from(new Set(data.map(d => d[targetCol])));
    const isBinaryOrCategorical = uniqueTargets.length <= 5;
    
    // Assign colors based on class
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const classColors: Record<string, string> = {};
    if (isBinaryOrCategorical) {
      uniqueTargets.forEach((t, i) => {
        classColors[String(t)] = colors[i % colors.length];
      });
    }

    return data.map((d, i) => ({
      x: d[xCol],
      y: d[yCol],
      target: d[targetCol],
      color: isBinaryOrCategorical ? classColors[String(d[targetCol])] : '#64748b'
    })).filter(d => typeof d.x === 'number' && typeof d.y === 'number');
  }, [data, xCol, yCol, targetCol]);

  const joinedX = `${xCol} + ${yCol}`;

  const rCode = `
# --------------- TP INF232 : Classification Supervisée ---------------

# Objectif : Prédire '\${targetCol}' en fonction de plusieurs variables
market_data$\${targetCol} <- as.factor(market_data$\${targetCol})

# 1. Séparer les données en "Train" (80%) et "Test" (20%)
set.seed(42)
index_train <- sample(1:nrow(market_data), 0.8 * nrow(market_data))
train_data <- market_data[index_train, ]
test_data <- market_data[-index_train, ]

# 2. Modèle : Régression Logistique (si classification binaire)
# famille "binomial" indique une régression logistique
modele_log <- glm(\${targetCol} ~ \${joinedX}, data = train_data, family = "binomial")

# 3. Résumé du modèle
summary(modele_log)

# 4. Évaluation sur l'ensemble de Test
pred_prob <- predict(modele_log, newdata = test_data, type = "response")
pred_class <- ifelse(pred_prob > 0.5, 1, 0)

# Matrice de confusion
table(Predicted = pred_class, Actual = test_data$\${targetCol})

# Note : Pour Random Forest, utilisez le package 'randomForest'
# library(randomForest)
# modele_rf <- randomForest(\${targetCol} ~ ., data=train_data)
  `;

  return (
    <div className="space-y-8 text-slate-50">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">4. Classification Supervisée</h2>
        <p className="text-slate-300">
          Entraîner un modèle (par ex. Régression Logistique) pour prédire une classe à partir de variables descriptives.
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Variable Cible (Classe à prédire Y)</label>
              <select 
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:border-emerald-500 outline-none border border-white/20 bg-white/5 backdrop-blur-md text-white transition-colors hover:border-white/30 hover:bg-white/10"
                value={targetCol} onChange={(e) => setTargetCol(e.target.value)}
              >
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex gap-4">
               <div className="flex-1">
                <label className="block text-sm font-semibold text-white mb-2">Variable explicative (Axe X)</label>
                <select 
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:border-emerald-500 outline-none border border-white/20 bg-white/5 backdrop-blur-md text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  value={xCol} onChange={(e) => setXCol(e.target.value)}
                >
                  {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-white mb-2">Variable explicative (Axe Y)</label>
                <select 
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:border-emerald-500 outline-none border border-white/20 bg-white/5 backdrop-blur-md text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  value={yCol} onChange={(e) => setYCol(e.target.value)}
                >
                  {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            
            <div className="text-xs text-amber-200 bg-amber-900/40 p-3 rounded-lg border border-amber-700/50 backdrop-blur-sm">
              Note: Un modèle complet nécessite le profilage de plusieurs variables. Cette vue projette en 2D pour séparer visuellement les classes. L'algorithme exact sera résolu par le script R.
            </div>
          </div>

          <div className="glass-panel p-5 h-[350px] flex flex-col">
            <h3 className="font-semibold mb-4 text-sm text-white">Visualisation de la séparation des classes</h3>
            <div className="flex-1">
              {plotData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" dataKey="x" name={xCol} tick={{fontSize: 12, fill: '#f8fafc'}} />
                    <YAxis type="number" dataKey="y" name={yCol} tick={{fontSize: 12, fill: '#f8fafc'}} />
                    <Tooltip cursor={{strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.5)'}} contentStyle={{backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff'}} />
                    <Scatter name="Classes" data={plotData}>
                      {plotData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                  Visualisation impossible avec ces paramètres
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
