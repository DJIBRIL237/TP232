import React, { useState, useMemo } from 'react';
import { RCodeBlock } from '../components/ui/RCodeBlock';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceDot } from 'recharts';
import { kmeans } from 'ml-kmeans';

export function UnsupervisedView({ data, columns }: { data: any[], columns: string[] }) {
  const numericCols = useMemo(() => columns.filter(col => typeof data[0][col] === 'number'), [data, columns]);
  
  const [xCol, setXCol] = useState(numericCols[0] || '');
  const [yCol, setYCol] = useState(numericCols[1] || numericCols[0] || '');
  const [k, setK] = useState<number>(3);

  const clusterResult = useMemo(() => {
    if (!xCol || !yCol || data.length < k) return null;
    
    // We cluster using ONLY the 2 selected visual variables for straightforward mapping 
    // (though real kmeans often uses many dimensions)
    const pts = data.map(d => [d[xCol], d[yCol]]).filter(p => typeof p[0] === 'number' && typeof p[1] === 'number');
    
    if (pts.length < k) return null;

    try {
      // Execute K-means
      const ans = kmeans(pts, k, { initialization: 'kmeans++' });
      
      const plotData = pts.map((p, i) => ({
        x: p[0],
        y: p[1],
        cluster: ans.clusters[i],
      }));

      return {
        plotData,
        centroids: ans.centroids.map(c => ({ x: c[0], y: c[1] }))
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [data, xCol, yCol, k]);

  const CLUSTER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const rCode = `
# --------------- TP INF232 : Classification Non-Supervisée (K-Means) ---------------

# 1. Sélectionner les variables et les standardiser
# La standardisation (scale) est primordiale pour le K-Means
vars_kmeans <- c("\${xCol}", "\${yCol}")
data_scale <- scale(market_data[, vars_kmeans])

# 2. Déterminer le nombre optimal de clusters K (Méthode du coude - optionnel)
# library(factoextra)
# fviz_nbclust(data_scale, kmeans, method = "wss")

# 3. Appliquer l'algorithme K-Means avec K = \${k}
set.seed(123) # Pour la reproductibilité
res_kmeans <- kmeans(data_scale, centers = \${k}, nstart = 25)

# 4. Ajouter les clusters au jeu de données original
market_data$Cluster <- as.factor(res_kmeans$cluster)

# 5. Visualisation des clusters
# Avec le package de base :
plot(market_data$\${xCol}, market_data$\${yCol}, 
     col = res_kmeans$cluster, 
     pch = 19, 
     main = "Clustering K-Means (K=\${k})",
     xlab="\${xCol}", ylab="\${yCol}")
points(res_kmeans$centers * attr(data_scale, 'scaled:scale') + attr(data_scale, 'scaled:center'), 
       col = 1:\${k}, pch = 8, cex = 2, lwd=2) # Afficher les centroïdes

# Avec factoextra (plus esthétique) :
# fviz_cluster(res_kmeans, data = data_scale,
#              palette = c("#2E9FDF", "#FC4E07", "#E7B800"),
#              geom = "point",
#              ellipse.type = "convex", 
#              ggtheme = theme_bw()
# )
  `;

  return (
    <div className="space-y-8 text-slate-50">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">5. Clustering & Classification Non-Supervisée</h2>
        <p className="text-slate-300">
          Utiliser l'algorithme K-Means pour regrouper les données en segments homogènes basés sur leurs similarités.
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <div className="flex gap-4">
               <div className="flex-1">
                <label className="block text-sm font-semibold text-white mb-2">Axe X</label>
                <select 
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500 outline-none border border-white/20 bg-white/5 backdrop-blur-md text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  value={xCol} onChange={(e) => setXCol(e.target.value)}
                >
                  {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-white mb-2">Axe Y</label>
                <select 
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500 outline-none border border-white/20 bg-white/5 backdrop-blur-md text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  value={yCol} onChange={(e) => setYCol(e.target.value)}
                >
                  {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-semibold text-white">Nombre de clusters (K)</label>
                <span className="font-bold text-cyan-400">{k}</span>
              </div>
              <input 
                type="range" min="2" max="7" step="1" 
                value={k} onChange={(e) => setK(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <div className="glass-panel p-5 h-[350px] flex flex-col">
            <h3 className="font-semibold mb-4 text-sm text-white flex justify-between">
              <span>Résultat de la segmentation (K-Means)</span>
            </h3>
            <div className="flex-1">
              {clusterResult && clusterResult.plotData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" dataKey="x" name={xCol} tick={{fontSize: 12, fill: '#f8fafc'}} />
                    <YAxis type="number" dataKey="y" name={yCol} tick={{fontSize: 12, fill: '#f8fafc'}} />
                    <Tooltip cursor={{strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.5)'}} contentStyle={{backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff'}} />
                    <Scatter name="Points" data={clusterResult.plotData}>
                      {clusterResult.plotData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CLUSTER_COLORS[entry.cluster % CLUSTER_COLORS.length]} />
                      ))}
                    </Scatter>
                    {/* Render Centroids */}
                    {clusterResult.centroids.map((c, i) => (
                      <ReferenceDot key={i} x={c.x} y={c.y} r={6} fill="#0f172a" stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                  Calcul des clusters impossible
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
