import { BlogPost } from '../types';

interface BlogPostsProps {
  posts: BlogPost[];
}

export function BlogPosts({ posts }: BlogPostsProps) {
  if (posts.length === 0) {
    return (
      <section className="blog-section">
        <div className="section-header">
          <h2>
            <span className="icon">📝</span>
            Satya's Scratchpad
          </h2>
          <p className="section-subtitle">Personal blog insights & AI analysis</p>
        </div>
        <div className="no-data">
          <p>No blog posts tracked yet. Check back soon!</p>
        </div>
      </section>
    );
  }

  const latestPost = posts[0];

  return (
    <section className="blog-section">
      <div className="section-header">
        <h2>
          <span className="icon">📝</span>
          Satya's Scratchpad
        </h2>
        <p className="section-subtitle">
          Personal blog insights from{' '}
          <a href="https://snscratchpad.com" target="_blank" rel="noopener noreferrer">
            snscratchpad.com
          </a>
        </p>
      </div>

      {/* Featured Latest Post */}
      <div className="blog-featured">
        <div className="blog-post-card featured">
          <div className="blog-post-header">
            <div className="blog-post-meta">
              <span className="blog-badge">Latest Post</span>
              <span className="blog-date">{new Date(latestPost.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>
            <h3 className="blog-post-title">
              <a href={latestPost.url} target="_blank" rel="noopener noreferrer">
                {latestPost.title}
              </a>
            </h3>
          </div>

          {latestPost.summary && (
            <div className="blog-post-section">
              <h4>📄 Summary</h4>
              <p>{latestPost.summary}</p>
            </div>
          )}

          {latestPost.ai_analysis && (
            <div className="blog-post-section">
              <h4>🤖 AI Analysis</h4>
              <p className="ai-commentary">{latestPost.ai_analysis}</p>
            </div>
          )}

          {latestPost.ai_predictions && (
            <div className="blog-post-section">
              <h4>🔮 Predictions</h4>
              <p className="ai-predictions">{latestPost.ai_predictions}</p>
            </div>
          )}

          <div className="blog-post-footer">
            <a
              href={latestPost.url}
              target="_blank"
              rel="noopener noreferrer"
              className="read-more-btn"
            >
              Read Full Post →
            </a>
          </div>
        </div>
      </div>

      {/* Previous Posts */}
      {posts.length > 1 && (
        <div className="blog-archive">
          <h3 className="archive-title">Previous Posts</h3>
          <div className="blog-grid">
            {posts.slice(1).map((post) => (
              <div key={post.id} className="blog-post-card">
                <div className="blog-post-header">
                  <span className="blog-date">{new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                  <h4 className="blog-post-title">
                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                      {post.title}
                    </a>
                  </h4>
                </div>

                {post.summary && (
                  <p className="blog-post-excerpt">{post.summary}</p>
                )}

                {post.ai_analysis && (
                  <div className="blog-post-section compact">
                    <p className="ai-commentary">{post.ai_analysis}</p>
                  </div>
                )}

                <div className="blog-post-footer">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="read-more-link"
                  >
                    Read more →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
