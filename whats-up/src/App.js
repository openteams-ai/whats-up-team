import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';
import Statistics from './components/Statistics';
import PRsTable from './components/PRsTable';
import DateRangeFilter from './components/DateRangeFilter';
import OrgFilter from './components/OrgFilter';

function App() {
  const [prsData, setPrsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedOrgs, setSelectedOrgs] = useState([]);

  useEffect(() => {
    const fetchPRs = async () => {
      try {
        let data;
        if (process.env.REACT_APP_USE_LOCAL_DATA === 'true') {
          const response = await fetch('/prs.json');
          if (!response.ok) throw new Error('Failed to load PR data');
          data = await response.json();
        } else {
          const snapshot = await getDocs(collection(db, 'prs'));
          data = snapshot.docs.map((doc) => doc.data());
        }
        setPrsData(data);
        setSelectedOrgs([...new Set(data.map((pr) => pr.org).filter(Boolean))].sort());
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPRs();
  }, []);

  const orgs = prsData
    ? [...new Set(prsData.map((pr) => pr.org).filter(Boolean))].sort()
    : [];

  const filteredPRs = prsData
    ? prsData.filter((pr) => {
        const prDate = new Date(pr.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const inDateRange = prDate >= start && prDate <= end;
        const inSelectedOrgs = selectedOrgs.includes(pr.org);
        return inDateRange && inSelectedOrgs;
      })
    : [];

  if (loading) {
    return <div className="container"><p>Loading PR data...</p></div>;
  }

  if (error) {
    return <div className="container error"><p>Error: {error}</p></div>;
  }

  if (!prsData || prsData.length === 0) {
    return <div className="container"><p>No PR data available</p></div>;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Team Contributions Dashboard</h1>
        <p>Track open source contributions made by team members</p>
      </header>
      
      <main className="container">
        <div className="filters">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <OrgFilter
            orgs={orgs}
            selectedOrgs={selectedOrgs}
            onSelectedOrgsChange={setSelectedOrgs}
          />
        </div>
        <Statistics prsData={filteredPRs} />
        <PRsTable prsData={filteredPRs} />
      </main>
    </div>
  );
}

export default App;
