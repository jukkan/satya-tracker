import { AnalyzedStar } from '../types';

interface TimelineProps {
  stars: AnalyzedStar[];
}

export function Timeline({ stars }: TimelineProps) {
  if (stars.length === 0) {
    return (
      <div className="timeline-container">
        <h2>Star History</h2>
        <p className="timeline-empty">No stars tracked yet. Check back soon!</p>
      </div>
    );
  }

  // Skip the first one as it's shown in LatestStar
  const timelineStars = stars.slice(1);

  return (
    <div className="timeline-container">
      <h2>Star History</h2>
      <div className="timeline">
        {timelineStars.map((star, index) => (
          <StarCard key={star.id} star={star} index={index} />
        ))}
      </div>
    </div>
  );
}

interface StarCardProps {
  star: AnalyzedStar;
  index: number;
}

function StarCard({ star, index }: StarCardProps) {
  const formattedDate = new Date(star.starred_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="star-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="star-card-header">
        <div className="star-date">{formattedDate}</div>
        <div className="star-count">⭐ {star.stargazers_count.toLocaleString()}</div>
      </div>

      <a href={star.html_url} target="_blank" rel="noopener noreferrer" className="star-repo-link">
        <h3 className="star-repo-name">{star.full_name}</h3>
      </a>

      {star.language && (
        <span className="language-badge">{star.language}</span>
      )}

      {star.description && (
        <p className="star-description">{star.description}</p>
      )}

      <div className="star-commentary">
        <div className="commentary-icon">🎅</div>
        <p>{star.commentary}</p>
      </div>

      {star.topics.length > 0 && (
        <div className="star-topics">
          {star.topics.slice(0, 5).map(topic => (
            <span key={topic} className="topic-tag">{topic}</span>
          ))}
        </div>
      )}
    </div>
  );
}
