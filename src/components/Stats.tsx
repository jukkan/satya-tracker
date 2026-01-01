import { AnalyzedStar } from '../types';

interface StatsProps {
  stars: AnalyzedStar[];
}

export function Stats({ stars }: StatsProps) {
  const totalStars = stars.length;
  const starsThisWeek = getStarsThisWeek(stars);
  const mood = inferMood(stars);
  const topLanguages = getTopLanguages(stars);

  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-value">{totalStars}</div>
        <div className="stat-label">Total Stars Tracked</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{starsThisWeek}</div>
        <div className="stat-label">Stars This Week</div>
      </div>

      <div className="stat-card mood-card">
        <div className="mood-icon">{mood.icon}</div>
        <div className="mood-label">{mood.label}</div>
        <div className="mood-description">{mood.description}</div>
      </div>

      {topLanguages.length > 0 && (
        <div className="stat-card languages-card">
          <div className="stat-label">Top Languages</div>
          <div className="languages-list">
            {topLanguages.slice(0, 3).map(({ language, count }) => (
              <div key={language} className="language-item">
                <span className="language-name">{language}</span>
                <span className="language-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getStarsThisWeek(stars: AnalyzedStar[]): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return stars.filter(star => new Date(star.starred_at) > oneWeekAgo).length;
}

function inferMood(stars: AnalyzedStar[]): { icon: string; label: string; description: string } {
  const recentStars = stars.slice(0, 10);

  if (recentStars.length === 0) {
    return {
      icon: '🤔',
      label: 'Awaiting Activity',
      description: 'No recent stars to analyze'
    };
  }

  const allTopics = recentStars.flatMap(star => star.topics);
  const topicCounts = new Map<string, number>();

  allTopics.forEach(topic => {
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  });

  // AI-focused
  const aiKeywords = ['ai', 'ml', 'machine-learning', 'llm', 'gpt', 'artificial-intelligence', 'deep-learning'];
  const aiCount = Array.from(topicCounts.entries())
    .filter(([topic]) => aiKeywords.some(kw => topic.toLowerCase().includes(kw)))
    .reduce((sum, [, count]) => sum + count, 0);

  if (aiCount >= 3) {
    return {
      icon: '🤖',
      label: 'AI-Obsessed Mode',
      description: 'Deep in the AI rabbit hole'
    };
  }

  // Infrastructure/Cloud
  const infraKeywords = ['kubernetes', 'k8s', 'docker', 'cloud', 'devops', 'infrastructure', 'azure'];
  const infraCount = Array.from(topicCounts.entries())
    .filter(([topic]) => infraKeywords.some(kw => topic.toLowerCase().includes(kw)))
    .reduce((sum, [, count]) => sum + count, 0);

  if (infraCount >= 3) {
    return {
      icon: '☁️',
      label: 'Cloud Infrastructure Mode',
      description: 'Scaling the enterprise'
    };
  }

  // Security
  const securityKeywords = ['security', 'auth', 'encryption', 'privacy'];
  const securityCount = Array.from(topicCounts.entries())
    .filter(([topic]) => securityKeywords.some(kw => topic.toLowerCase().includes(kw)))
    .reduce((sum, [, count]) => sum + count, 0);

  if (securityCount >= 2) {
    return {
      icon: '🔒',
      label: 'Security-Conscious',
      description: 'Locking down the enterprise'
    };
  }

  // Developer tools
  const devToolsKeywords = ['cli', 'tool', 'developer', 'productivity'];
  const devToolsCount = Array.from(topicCounts.entries())
    .filter(([topic]) => devToolsKeywords.some(kw => topic.toLowerCase().includes(kw)))
    .reduce((sum, [, count]) => sum + count, 0);

  if (devToolsCount >= 2) {
    return {
      icon: '🛠️',
      label: 'Tooling Enthusiast',
      description: 'Developer experience matters'
    };
  }

  return {
    icon: '🎯',
    label: 'Exploring',
    description: 'Diverse interests detected'
  };
}

function getTopLanguages(stars: AnalyzedStar[]): { language: string; count: number }[] {
  const languageCounts = new Map<string, number>();

  stars.forEach(star => {
    if (star.language) {
      languageCounts.set(star.language, (languageCounts.get(star.language) || 0) + 1);
    }
  });

  return Array.from(languageCounts.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);
}
