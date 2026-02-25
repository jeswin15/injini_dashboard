import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { CohortView } from './components/cohorts/CohortView';
import { OverallView } from './components/cohorts/OverallView';

function App() {
  const [activeTab, setActiveTab] = useState('Cohort 1');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab.startsWith('Cohort') && <CohortView cohortName={activeTab} />}
      {activeTab === 'Overall' && <OverallView />}
    </Layout>
  );
}

export default App;
