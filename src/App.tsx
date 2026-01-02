import { useEffect, useState } from 'react';
import { LatestStar } from './components/LatestStar';
import { Stats } from './components/Stats';
import { Timeline } from './components/Timeline';
import { AnalyzedStar } from './types';
import './App.css';

function App() {
  const [stars, setStars] = useState<AnalyzedStar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStars();
  }, []);

  async function loadStars() {
    try {
      setLoading(true);
      setError(null);

      // In production, this will be served from the same domain
      const response = await fetch('/data/stars-analyzed.json');

      if (!response.ok) {
        throw new Error('Failed to load stars data');
      }

      const data = await response.json();
      setStars(data);
    } catch (err) {
      console.error('Error loading stars:', err);
      setError('Failed to load star data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Tracking Satya...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>❌ Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const latestStar = stars.length > 0 ? stars[0] : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <span className="santa-icon">🎅</span>
            Satya Tracker
          </h1>
          <p className="tagline">Real-time monitoring of Microsoft CEO's GitHub activity</p>
        </div>
      </header>

      <main className="main-content">
        <LatestStar star={latestStar} />
        <Stats stars={stars} />
        <Timeline stars={stars} />
      </main>

      <footer className="app-footer">
        <p>
          Tracking{' '}
          <a href="https://github.com/saztd" target="_blank" rel="noopener noreferrer">
            @saztd
          </a>
          {' '}• Powered by{' '}
          <a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer">
            Anthropic Claude
          </a>
          {' '}• Updates every 6 hours
        </p>
        <p className="disclaimer">
          This is a satirical project for entertainment purposes. Not affiliated with Microsoft or Satya Nadella.
        </p>
      </footer>
    </div>
  );
}

export default App;
