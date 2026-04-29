import React, { useState, useMemo } from 'react';
import { RCodeBlock } from '../components/ui/RCodeBlock';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function SimpleRegressionView({ data, columns }: { data: any[], columns: string[] }) {
  const numericCols = useMemo(() => columns.filter(col => typeof data[0][col] === 'number'), [data, columns]);
  
  const [xCol, setXCol] = useState(numericCols[0] || '');
  const [yCol, setYCol] = useState(numericCols.length > 1 ? numericCols[1] : numericCols[0] || '');

  // Math stuff for simple linear regression
  const model = useMemo(() => {
    if (!xCol || !yCol || data.length === 0) return null;
    
    const pts = data.map(d => ({ x: d[xCol], y: d[yCol] })).filter(d => typeof d.x === 'number' && typeof d.y === 'number');
    if (pts.length < 2) return null;

    const n = pts.length;
    const meanX = pts.reduce((a, b) => a + b.x, 0) / n;
    const meanY = pts.reduce((a, b) => a + b.y, 0) / n;

    let num = 0;
    let den = 0;
    let ssTot = 0;

    for (let i = 0; i < n; i++) {
      num += (pts[i].x - meanX) * (pts[i].y - meanY);
      den += Math.pow(pts[i].x - meanX, 2);
      ssTot += Math.pow(pts[i].y - meanY, 2);
    }

    const b1 = den === 0 ? 0 : num / den;
    const b0 = meanY - b1 * meanX;

    let ssRes = 0;
    for (let i = 0; i < n; i++) {
        const yPred = b0 + b1 * pts[i].x;
        ssRes += Math.pow(pts[i].y - yPred, 2);
    }
    const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

    // Provide two points to draw the regression line
    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    const lineData = [
      { x: minX, y: b0 + b1 * minX },
      { x: maxX, y: b0 + b1 * maxX }
    ];

    return { b0, b1, r2, lineData, pts };
  }, [data, xCol, yCol]);

  const rCode = `
# --------------- TP INF232 : Régression Linéaire Simple ---------------

# 1. Ajustement du modèle de régression
# Modèle : ${yCol} expliquée par ${xCol}
modele_simple <- lm(${yCol} ~ ${xCol}, data = market_data)

# 2. Affichage des coefficients et statistiques (R-carré, p-value)
summary(modele_simple)

# 3. Tracé du nuage de points
plot(market_data$${xCol}, market_data$${yCol}, 
     main="Régression Simple : ${yCol} vs ${xCol}",
     xlab="${xCol}", ylab="${yCol}",
     pch=19, col="#3b82f6")

# 4. Ajout de la droite de régression
abline(modele_simple, col="red", lwd=2)

# Prédiction
# predict(modele_simple, newdata=data.frame(${xCol}=c(100, 200)))
  `;

  return (
    <div className="space-y-8 text-slate-50">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">1. Régression Linéaire Simple</h2>
        <p className="text-slate-300">
          Modéliser la relation entre une variable explicative (X) et une variable dépendante (Y).
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-semibold text-white">Configuration</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="label-caps block mb-2 text-slate-300">Variable Explicative (X)</label>
                <select 
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 outline-none border border-white/20 bg-white/5 backdrop-blur-md text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  value={xCol} onChange={(e) => setXCol(e.target.value)}
                >
                  {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="label-caps block mb-2 text-slate-300">Variable Cible (Y)</label>
                <select 
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 outline-none border border-white/20 bg-white/5 backdrop-blur-md text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  value={yCol} onChange={(e) => setYCol(e.target.value)}
                >
                  {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {model && (
              <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 flex items-center justify-between mt-6">
                <div>
                  <div className="label-caps text-slate-400 mb-1">Équation du Modèle</div>
                  <div className="font-mono text-sm tracking-widest text-emerald-300">
                    Y = {model.b0.toFixed(2)} {model.b1 >= 0 ? '+' : ''} {model.b1.toFixed(3)} * X
                  </div>
                </div>
                <div className="text-right">
                  <div className="label-caps text-slate-400 mb-1">R-carré (R²)</div>
                  <div className="font-bold text-2xl text-blue-400">{(model.r2 * 100).toFixed(1)}%</div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel p-5 h-[350px] flex flex-col">
            <h3 className="font-semibold mb-4 text-sm text-white">Nuage de points et Droite de Régression</h3>
            <div className="flex-1">
              {model && model.pts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" dataKey="x" name={xCol} tick={{fontSize: 12, fill: '#f8fafc'}} domain={['auto', 'auto']} />
                    <YAxis type="number" dataKey="y" name={yCol} tick={{fontSize: 12, fill: '#f8fafc'}} domain={['auto', 'auto']} />
                    <Tooltip cursor={{strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.5)'}} contentStyle={{backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff'}} />
                    <Scatter name="Données" data={model.pts} fill="#3b82f6" opacity={0.6} />
                    {model.lineData && (
                      <ReferenceLine 
                        segment={[
                          {x: model.lineData[0].x, y: model.lineData[0].y}, 
                          {x: model.lineData[1].x, y: model.lineData[1].y}
                        ]} 
                        stroke="#f43f5e" 
                        strokeWidth={2}
                      />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                  Sélectionnez des colonnes numériques valides
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
