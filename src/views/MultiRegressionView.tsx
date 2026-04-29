import React, { useState, useMemo } from 'react';
import { RCodeBlock } from '../components/ui/RCodeBlock';
import { Matrix, solve } from 'ml-matrix';

export function MultiRegressionView({ data, columns }: { data: any[], columns: string[] }) {
  const numericCols = useMemo(() => columns.filter(col => typeof data[0][col] === 'number'), [data, columns]);
  
  const [yCol, setYCol] = useState(numericCols.length > 0 ? numericCols[numericCols.length - 1] : '');
  const [xCols, setXCols] = useState<string[]>(numericCols.length > 1 ? [numericCols[0], numericCols[1]] : []);

  const toggleXCol = (col: string) => {
    if (xCols.includes(col)) {
      setXCols(xCols.filter(c => c !== col));
    } else {
      setXCols([...xCols, col]);
    }
  };

  const model = useMemo(() => {
    if (!yCol || xCols.length === 0 || data.length === 0) return null;
    
    // Build matrices
    const pts = data.filter(d => typeof d[yCol] === 'number' && xCols.every(c => typeof d[c] === 'number'));
    if (pts.length <= xCols.length) return null; // Need more data points than variables

    try {
      // Y vector
      const Y = Matrix.columnVector(pts.map(d => d[yCol]));
      // X matrix with intercept (column of 1s)
      const X = new Matrix(pts.map(d => [1, ...xCols.map(c => d[c])]));
      
      // Beta = (X^T * X)^-1 * X^T * Y
      // We can use solve, which handles pseudo-inverse for Least Squares
      const XtX = X.transpose().mmul(X);
      const XtY = X.transpose().mmul(Y);
      const beta = solve(XtX, XtY).to1DArray();

      // Calculate R^2
      const yMean = pts.reduce((a, b) => a + b[yCol], 0) / pts.length;
      let ssTot = 0;
      let ssRes = 0;

      for (let i = 0; i < pts.length; i++) {
        const actual = pts[i][yCol];
        let predicted = beta[0]; // intercept
        for (let j = 0; j < xCols.length; j++) {
          predicted += beta[j + 1] * pts[i][xCols[j]];
        }
        ssTot += Math.pow(actual - yMean, 2);
        ssRes += Math.pow(actual - predicted, 2);
      }

      const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

      return {
        intercept: beta[0],
        coefficients: beta.slice(1),
        r2
      };
    } catch (e) {
      console.error("Matrix error", e);
      return null;
    }
  }, [data, yCol, xCols]);

  const joinedX = xCols.length > 0 ? xCols.join(" + ") : "X1 + X2";
  
  const rCode = `
# --------------- TP INF232 : Régression Linéaire Multiple ---------------

# 1. Ajustement du modèle de régression multiple
# Modèle : \${yCol} en fonction de \${xCols.length > 0 ? xCols.join(", ") : "..."}
modele_multiple <- lm(\${yCol} ~ \${joinedX}, data = market_data)

# 2. Résumé détaillé du modèle (coefficients, R-carré ajusté, p-values, test F)
summary(modele_multiple)

# 3. Évaluation du modèle (Diagnostic plots)
par(mfrow=c(2,2)) # Diviser la fenêtre graphique
plot(modele_multiple)
par(mfrow=c(1,1)) # Rétablir

# 4. Importance des variables (Optionnel : package 'caret' ou fonction 'anova')
anova(modele_multiple)
`;

  return (
    <div className="space-y-8 text-slate-50">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">2. Régression Linéaire Multiple</h2>
        <p className="text-slate-300">
          Modéliser la relation entre la cible (Y) et plusieurs variables explicatives (Xi).
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-panel p-5 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">1. Variable Cible (Y)</label>
              <select 
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 outline-none border border-white/20 bg-white/5 backdrop-blur-md text-white transition-colors hover:border-white/30 hover:bg-white/10"
                value={yCol} onChange={(e) => setYCol(e.target.value)}
              >
                {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">2. Variables Explicatives (Xi)</label>
              <div className="flex flex-wrap gap-2">
                {numericCols.filter(c => c !== yCol).map(c => {
                  const isSelected = xCols.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleXCol(c)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-500/20 border-blue-400 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                          : 'bg-white/5 border-white/20 text-slate-300 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-semibold mb-4 text-sm text-white">Résultats du Modèle</h3>
            {model ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="text-sm text-slate-300 text-center flex-1 border-r border-white/10">
                    <div className="font-semibold text-white mb-1">R-carré (Explication variance)</div>
                    <div className="text-2xl font-bold text-blue-400">{(model.r2 * 100).toFixed(1)}%</div>
                  </div>
                  <div className="text-sm text-slate-300 text-center flex-1">
                    <div className="font-semibold text-white mb-1">Intercept (ß0)</div>
                    <div className="text-lg font-mono tracking-widest">{model.intercept.toFixed(2)}</div>
                  </div>
                </div>

                <div>
                  <h4 className="label-caps text-slate-400 mb-3">Coefficients (ßi)</h4>
                  <div className="space-y-2">
                    {xCols.map((col, idx) => (
                      <div key={col} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl text-sm transition-colors hover:bg-white/10">
                        <span className="font-medium text-slate-200">{col}</span>
                        <span className="font-mono text-emerald-300 tracking-wider">
                          {model.coefficients[idx].toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-400 bg-black/20 rounded-2xl border border-dashed border-white/10">
                Sélectionnez Y et au moins deux variables X pour générer le modèle.
              </div>
            )}
          </div>
        </div>

        <div>
          <RCodeBlock code={rCode} className="h-full" />
        </div>
      </div>
    </div>
  );
}
