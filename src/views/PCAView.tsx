import React, { useState, useMemo } from 'react';
import { RCodeBlock } from '../components/ui/RCodeBlock';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { PCA } from 'ml-pca';

export function PCAView({ data, columns }: { data: any[], columns: string[] }) {
  const numericCols = useMemo(() => columns.filter(col => typeof data[0][col] === 'number'), [data, columns]);
  const [selectedCols, setSelectedCols] = useState<string[]>(numericCols.slice(0, 4));

  const toggleCol = (col: string) => {
    if (selectedCols.includes(col)) {
      setSelectedCols(selectedCols.filter(c => c !== col));
    } else {
      setSelectedCols([...selectedCols, col]);
    }
  };

  const pcaResult = useMemo(() => {
    if (selectedCols.length < 2 || data.length < 2) return null;

    const dataset = data.map(row => selectedCols.map(col => row[col] || 0));
    try {
      // Create PCA model. center: true, scale: true is standard for PCA to normalize features.
      const pca = new PCA(dataset, { center: true, scale: true });
      
      const explainedVariance = pca.getExplainedVariance();
      
      // Project the data into 2D (PC1 and PC2)
      const projected = pca.predict(dataset).to2DArray();
      
      const plotData = projected.map((p, i) => ({
        pc1: p[0],
        pc2: p[1],
        originalIndex: i
      }));

      return {
        explainedVariance: explainedVariance.slice(0, 5), // top 5 components
        plotData
      };
    } catch (err) {
      console.error("PCA Error", err);
      return null;
    }
  }, [data, selectedCols]);

  const joinedCols = selectedCols.length > 0 ? selectedCols.join('", "') : "";

  const rCode = `
# --------------- TP INF232 : Réduction de Dimension (ACP) ---------------

# 1. Sélectionner les variables numériques pertinentes
vars_pca <- c("\${joinedCols}")
data_pca <- market_data[, vars_pca]

# 2. Exécuter l'Analyse en Composantes Principales (centrer et réduire = TRUE)
res_pca <- prcomp(data_pca, center = TRUE, scale. = TRUE)

# 3. Résumé de l'ACP (Proportion de variance expliquée)
summary(res_pca)

# 4. Visualisations de base
# Scree plot (éboulis des valeurs propres)
plot(res_pca, type = "l", main="Scree Plot")

# Cercle des corrélations et biplot (utiliser FactoMineR et factoextra pour de plus beaux graphs)
# install.packages(c("FactoMineR", "factoextra"))
# library(factoextra)
# fviz_pca_var(res_pca, col.var="contrib")     # Variables
# fviz_pca_ind(res_pca, geom = "point")        # Individus
  `;

  return (
    <div className="space-y-8 text-slate-50">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">3. Réduction des Dimensionnalités (ACP)</h2>
        <p className="text-slate-300">
          L'Analyse en Composantes Principales synthétise les données quantitatives en conservant un maximum de variance.
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-panel p-5">
             <label className="block text-sm font-semibold text-white mb-3">Variables pour l'ACP (min 2)</label>
              <div className="flex flex-wrap gap-2">
                {numericCols.map(c => {
                  const isSelected = selectedCols.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCol(c)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                          : 'bg-white/5 border-white/20 text-slate-300 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
          </div>

          <div className="glass-panel p-5 h-[350px] flex flex-col">
            <h3 className="font-semibold mb-4 text-sm text-white flex justify-between items-center">
              <span>Projection des individus (PC1 vs PC2)</span>
              {pcaResult && (
                <span className="text-xs font-normal text-slate-400">
                  Variance expliquée ({((pcaResult.explainedVariance[0] + pcaResult.explainedVariance[1]) * 100).toFixed(1)}%)
                </span>
              )}
            </h3>
            <div className="flex-1">
              {pcaResult && pcaResult.plotData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      type="number" dataKey="pc1" name="PC1" tick={{fontSize: 12, fill: '#f8fafc'}} 
                      label={{ value: `Dim 1 (${(pcaResult.explainedVariance[0]*100).toFixed(1)}%)`, position: 'bottom', fontSize: 12, fill: '#f8fafc' }} 
                    />
                    <YAxis 
                      type="number" dataKey="pc2" name="PC2" tick={{fontSize: 12, fill: '#f8fafc'}} 
                      label={{ value: `Dim 2 (${(pcaResult.explainedVariance[1]*100).toFixed(1)}%)`, angle: -90, position: 'left', fontSize: 12, fill: '#f8fafc' }} 
                    />
                    <ZAxis range={[30, 30]} />
                    <Tooltip cursor={{strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.5)'}} contentStyle={{backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff'}} formatter={(v) => Number(v).toFixed(3)} />
                    <Scatter name="Individu" data={pcaResult.plotData} fill="#a855f7" opacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400 text-center px-8">
                  Sélectionnez au moins 2 variables pour calculer l'Analyse en Composantes Principales.
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
