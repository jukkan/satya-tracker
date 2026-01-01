import { AnalyzedStar } from '../types';

interface LatestStarProps {
  star: AnalyzedStar | null;
}

export function LatestStar({ star }: LatestStarProps) {
  if (!star) {
    return (
      <div className="latest-star">
        <div className="latest-header">
          <span className="live-indicator">
            <span className="live-dot"></span>
            LIVE
          </span>
          <h2>LATEST SATYA SIGHTING</h2>
        </div>
        <div className="latest-content empty">
          <p>No stars tracked yet. Waiting for Satya to make a move...</p>
        </div>
      </div>
    );
  }

  const timeAgo = getTimeAgo(star.starred_at);

  return (
    <div className="latest-star">
      <div className="latest-header">
        <span className="live-indicator">
          <span className="live-dot"></span>
          LIVE
        </span>
        <h2>LATEST SATYA SIGHTING</h2>
      </div>
      <div className="latest-content">
        <div className="latest-time">{timeAgo}</div>
        <a href={star.html_url} target="_blank" rel="noopener noreferrer" className="latest-repo">
          <h3>{star.full_name}</h3>
        </a>
        {star.language && (
          <span className="language-badge">{star.language}</span>
        )}
        {star.description && <p className="repo-description">{star.description}</p>}
        <div className="commentary-box">
          <div className="commentary-label">🎅 AI ANALYSIS</div>
          <p className="commentary">{star.commentary}</p>
        </div>
        {star.topics.length > 0 && (
          <div className="topics">
            {star.topics.slice(0, 5).map(topic => (
              <span key={topic} className="topic-tag">{topic}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
