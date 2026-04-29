import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { sampleMarketingData, getSampleColumns } from './data/sampleData';
import { UploadView } from './views/UploadView';
import { DescriptiveView } from './views/DescriptiveView';
import { SimpleRegressionView } from './views/SimpleRegressionView';
import { MultiRegressionView } from './views/MultiRegressionView';
import { PCAView } from './views/PCAView';
import { SupervisedView } from './views/SupervisedView';
import { UnsupervisedView } from './views/UnsupervisedView';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  
  // App data state
  const [data, setData] = useState<any[]>(sampleMarketingData);
  const [columns, setColumns] = useState<string[]>(getSampleColumns());
  const [targetColumn, setTargetColumn] = useState<string>('Sales');

  const updateData = (newData: any[]) => {
    setData(newData);
    if (newData.length > 0) {
      setColumns(Object.keys(newData[0]));
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadView data={data} columns={columns} onDataChanged={updateData} />;
      case 'descriptive':
        return <DescriptiveView data={data} columns={columns} />;
      case 'simple-regression':
        return <SimpleRegressionView data={data} columns={columns} />;
      case 'multi-regression':
        return <MultiRegressionView data={data} columns={columns} />;
      case 'pca':
        return <PCAView data={data} columns={columns} />;
      case 'supervised':
        return <SupervisedView data={data} columns={columns} />;
      case 'unsupervised':
        return <UnsupervisedView data={data} columns={columns} />;
      default:
        return <UploadView data={data} columns={columns} onDataChanged={updateData} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in duration-300">
        {renderView()}
      </div>
    </Layout>
  );
}
