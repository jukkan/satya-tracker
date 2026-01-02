import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BlogPost {
  id: string;
  title: string;
  url: string;
  published_at: string;
  content?: string;
  excerpt?: string;
  summary?: string;
  ai_analysis?: string;
  ai_predictions?: string;
  analyzed_at?: string;
}

const DATA_FILE = path.join(__dirname, '../public/data/blog-posts.json');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const BLOG_URL = 'https://snscratchpad.com';

// Manual blog post entries for when automated fetching fails
const KNOWN_POSTS: Partial<BlogPost>[] = [
  {
    id: 'looking-ahead-2026',
    title: 'Looking Ahead to 2026',
    url: 'https://snscratchpad.com/posts/looking-ahead-2026/?v=1',
    published_at: '2025-12-29T00:00:00Z',
    excerpt: 'Satya Nadella discusses how 2026 will be a pivotal year for AI, moving from discovery to diffusion phase. He emphasizes the need to stop obsessing over model quality and start thinking about systems, getting beyond "slop vs sophistication" debates.',
  },
];

async function generateBlogAnalysis(post: Partial<BlogPost>): Promise<{ summary: string; analysis: string; predictions: string }> {
  if (!ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set, using fallback analysis');
    return {
      summary: post.excerpt || 'A new blog post from Satya Nadella.',
      analysis: 'AI analysis unavailable - API key not configured.',
      predictions: 'Unable to generate predictions without API access.',
    };
  }

  const client = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });

  try {
    console.log(`Generating analysis for "${post.title}"...`);

    // Generate summary and analysis
    const analysisPrompt = `Analyze this blog post by Satya Nadella, Microsoft's CEO:

Title: ${post.title}
URL: ${post.url}
Published: ${post.published_at}
Content/Excerpt: ${post.excerpt || post.content || 'No content available'}

Please provide:
1. A concise 2-3 sentence summary of the key points
2. Witty, satirical analysis (3-4 sentences) connecting this to Microsoft's broader strategy, recent moves, and Satya's leadership style. Be entertaining but insightful.
3. Bold predictions (2-3 sentences) about what this signals for Microsoft's future direction

Format your response as:
SUMMARY: [your summary]
ANALYSIS: [your analysis]
PREDICTIONS: [your predictions]`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: analysisPrompt
      }]
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse the response
    const summaryMatch = responseText.match(/SUMMARY:\s*(.+?)(?=\nANALYSIS:|$)/s);
    const analysisMatch = responseText.match(/ANALYSIS:\s*(.+?)(?=\nPREDICTIONS:|$)/s);
    const predictionsMatch = responseText.match(/PREDICTIONS:\s*(.+?)$/s);

    return {
      summary: summaryMatch?.[1]?.trim() || post.excerpt || 'Summary unavailable',
      analysis: analysisMatch?.[1]?.trim() || 'Analysis unavailable',
      predictions: predictionsMatch?.[1]?.trim() || 'Predictions unavailable',
    };
  } catch (error) {
    console.error(`Error generating analysis for "${post.title}":`, error);
    return {
      summary: post.excerpt || 'A new blog post from Satya Nadella.',
      analysis: 'AI analysis failed. The commentary gods were busy.',
      predictions: 'Crystal ball is cloudy. Check back later.',
    };
  }
}

async function loadBlogPosts(): Promise<BlogPost[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing blog data file, starting fresh');
    return [];
  }
}

async function saveBlogPosts(posts: BlogPost[]): Promise<void> {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

async function fetchBlogPosts(): Promise<Partial<BlogPost>[]> {
  console.log(`Attempting to fetch blog posts from ${BLOG_URL}...`);

  try {
    // Attempt to fetch the blog homepage
    const response = await fetch(BLOG_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // TODO: Parse HTML to extract blog posts
    // For now, fall back to manual entries since the site blocks automation
    console.log('Blog fetch succeeded but parsing not yet implemented');
    return KNOWN_POSTS;
  } catch (error) {
    console.log('Unable to fetch blog automatically:', (error as Error).message);
    console.log('Using manually curated blog post list');
    return KNOWN_POSTS;
  }
}

async function main() {
  console.log('📝 Satya Blog Tracker - Analyzing Blog Posts...\n');

  try {
    // Load existing analyzed posts
    const existingPosts = await loadBlogPosts();
    const existingIds = new Set(existingPosts.map(p => p.id));

    console.log(`Found ${existingPosts.length} previously analyzed posts`);

    // Fetch/load known blog posts
    const fetchedPosts = await fetchBlogPosts();

    // Identify new posts
    const newPosts = fetchedPosts.filter(post => post.id && !existingIds.has(post.id));

    if (newPosts.length === 0) {
      console.log('\n✨ No new blog posts to analyze!');
      return;
    }

    console.log(`\n🆕 Found ${newPosts.length} new posts to analyze\n`);

    // Generate analysis for new posts
    const analyzedNewPosts: BlogPost[] = [];

    for (let i = 0; i < newPosts.length; i++) {
      const post = newPosts[i];
      console.log(`[${i + 1}/${newPosts.length}] Analyzing "${post.title}"...`);

      const { summary, analysis, predictions } = await generateBlogAnalysis(post);

      analyzedNewPosts.push({
        id: post.id!,
        title: post.title!,
        url: post.url!,
        published_at: post.published_at!,
        content: post.content,
        excerpt: post.excerpt,
        summary,
        ai_analysis: analysis,
        ai_predictions: predictions,
        analyzed_at: new Date().toISOString(),
      });

      // Rate limiting: wait between API calls
      if (i < newPosts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Combine and sort (newest first)
    const allPosts = [...analyzedNewPosts, ...existingPosts].sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    // Save updated data
    await saveBlogPosts(allPosts);

    console.log(`\n✅ Analysis complete! Total posts: ${allPosts.length}`);
    console.log(`📝 Updated ${DATA_FILE}`);

    if (analyzedNewPosts.length > 0) {
      console.log('\n🎯 Latest post:');
      console.log(`   ${analyzedNewPosts[0].title}`);
      console.log(`   Analysis: "${analyzedNewPosts[0].ai_analysis}"`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
