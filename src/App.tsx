import { useEffect, useState } from 'react';
import { LatestStar } from './components/LatestStar';
import { Stats } from './components/Stats';
import { Timeline } from './components/Timeline';
import { BlogPosts } from './components/BlogPosts';
import { AnalyzedStar, BlogPost } from './types';
import './App.css';

function App() {
  const [stars, setStars] = useState<AnalyzedStar[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Load both stars and blog posts in parallel
      const [starsResponse, blogResponse] = await Promise.all([
        fetch('/data/stars-analyzed.json'),
        fetch('/data/blog-posts.json').catch(() => null),
      ]);

      if (!starsResponse.ok) {
        throw new Error('Failed to load stars data');
      }

      const starsData = await starsResponse.json();
      setStars(starsData);

      // Blog posts might not exist yet, so handle gracefully
      if (blogResponse && blogResponse.ok) {
        const blogData = await blogResponse.json();
        setBlogPosts(blogData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again later.');
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
        <BlogPosts posts={blogPosts} />
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
