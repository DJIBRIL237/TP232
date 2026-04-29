import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { sampleMarketingData } from '../data/sampleData';
import { RCodeBlock } from '../components/ui/RCodeBlock';

interface UploadViewProps {
  data: any[];
  columns: string[];
  onDataChanged: (data: any[]) => void;
}

export function UploadView({ data, columns, onDataChanged }: UploadViewProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          onDataChanged(results.data);
        }
      },
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const loadSampleData = () => {
    onDataChanged([...sampleMarketingData]);
  };

  const rCode = `
# --------------- TP INF232 : Importation des données en ligne ---------------

# 1. Spécifier le chemin ou l'URL du fichier CSV
# file_path <- "chemin/vers/votre/dataset_marketing.csv"
file_path <- "market_data.csv"

# 2. Charger les données dans un Data Frame
market_data <- read.csv(file_path, header = TRUE, sep = ",")

# 3. Aperçu des données
head(market_data)

# 4. Vérifier la structure et les types de données
str(market_data)
summary(market_data)
  `;

  return (
    <div className="space-y-8 text-slate-50">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Données & Import</h2>
        <p className="text-slate-300">
          Importez votre propre dataset CSV ou utilisez le jeu de données marketing simulé pour générer le code R de votre TP.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-200 ${dragActive ? 'border-blue-400 bg-blue-900/20' : 'border-white/20 hover:border-white/40 glass-panel bg-white/5'}`}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-white/10 p-4 rounded-full mb-4">
                <UploadCloud className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Glissez-déposez votre CSV</h3>
              <p className="text-sm text-slate-400 mb-6">ou cliquez pour parcourir</p>
              
              <label className="cursor-pointer bg-white/10 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors border border-white/10">
                Sélectionner un fichier
                <input type="file" accept=".csv" className="hidden" onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
            <FileSpreadsheet className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="font-semibold mb-2">Utiliser les données de démonstration</h3>
            <p className="text-sm text-slate-400 mb-4">Jeu de données avec 20 campagnes marketing simulées</p>
            <button 
              onClick={loadSampleData}
              className="flex items-center gap-2 bg-white/10 text-slate-100 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
            >
              <RotateCcw className="w-4 h-4" /> Charger les données démo
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="glass-panel overflow-hidden flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Aperçu ({data.length} lignes)</h3>
            </div>
            <div className="overflow-auto flex-1 max-h-[300px]">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-300 bg-white/10 sticky top-0 uppercase z-10 backdrop-blur-md">
                  <tr>
                    {columns.slice(0, 7).map((col) => (
                      <th key={col} className="px-4 py-2 font-medium border-b border-white/10">{col}</th>
                    ))}
                    {columns.length > 7 && <th className="px-4 py-2 font-medium border-b border-white/10">...</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      {columns.slice(0, 7).map((col) => (
                        <td key={col} className="px-4 py-2">{row[col]}</td>
                      ))}
                      {columns.length > 7 && <td className="px-4 py-2 text-slate-500">...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <RCodeBlock code={rCode} title="Importer des données dans R" />
        </div>
      </div>
    </div>
  );
}
