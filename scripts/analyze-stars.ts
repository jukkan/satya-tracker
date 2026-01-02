import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GitHubRepo {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  pushed_at: string;
}

interface AnalyzedStar {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  starred_at: string;
  commentary: string;
  analyzed_at: string;
}

const GITHUB_USER = 'saztd';
const DATA_FILE = path.join(__dirname, '../public/data/stars-analyzed.json');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function fetchGitHubStars(): Promise<GitHubRepo[]> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Satya-Tracker',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const allStars: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `https://api.github.com/users/${GITHUB_USER}/starred?page=${page}&per_page=${perPage}`;
    console.log(`Fetching page ${page}...`);

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const stars = await response.json() as GitHubRepo[];

    if (stars.length === 0) {
      break;
    }

    allStars.push(...stars);

    // Check if there are more pages
    const linkHeader = response.headers.get('Link');
    if (!linkHeader || !linkHeader.includes('rel="next"')) {
      break;
    }

    page++;
  }

  console.log(`Fetched ${allStars.length} total stars`);
  return allStars;
}

async function generateCommentary(repo: GitHubRepo): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set, using fallback commentary');
    return `Satya has discovered ${repo.full_name}. Interesting choice.`;
  }

  const client = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });

  const topicsText = repo.topics.length > 0 ? repo.topics.join(', ') : 'none';

  const prompt = `Analyze this GitHub repository that Satya Nadella just starred:

Repo: ${repo.full_name}
Description: ${repo.description || 'No description'}
Topics: ${topicsText}
Language: ${repo.language || 'Unknown'}
Stars: ${repo.stargazers_count}

Write 2-3 sentences of playful satirical commentary on what this star reveals about Microsoft's CEO thinking. Reference Microsoft strategy when relevant. Be witty but not mean. Keep it light and fun.`;

  try {
    console.log(`Generating commentary for ${repo.full_name}...`);

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const commentary = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Commentary generation failed.';

    return commentary.trim();
  } catch (error) {
    console.error(`Error generating commentary for ${repo.full_name}:`, error);
    return `Satya has starred ${repo.full_name}. The AI commentary gods were not available to interpret this move.`;
  }
}

async function loadAnalyzedStars(): Promise<AnalyzedStar[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing data file, starting fresh');
    return [];
  }
}

async function saveAnalyzedStars(stars: AnalyzedStar[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(stars, null, 2), 'utf-8');
}

async function main() {
  console.log('🎅 Satya Tracker - Analyzing GitHub Stars...\n');

  try {
    // Load existing analyzed stars
    const existingStars = await loadAnalyzedStars();
    const existingIds = new Set(existingStars.map(s => s.id));

    console.log(`Found ${existingStars.length} previously analyzed stars`);

    // Fetch current stars
    const currentStars = await fetchGitHubStars();

    // Identify new stars
    const newStars = currentStars.filter(star => !existingIds.has(star.id));

    if (newStars.length === 0) {
      console.log('\n✨ No new stars to analyze!');
      return;
    }

    console.log(`\n🆕 Found ${newStars.length} new stars to analyze\n`);

    // Generate commentary for new stars
    const analyzedNewStars: AnalyzedStar[] = [];

    for (let i = 0; i < newStars.length; i++) {
      const repo = newStars[i];
      console.log(`[${i + 1}/${newStars.length}] Analyzing ${repo.full_name}...`);

      const commentary = await generateCommentary(repo);

      analyzedNewStars.push({
        id: repo.id,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        language: repo.language,
        topics: repo.topics,
        starred_at: new Date().toISOString(),
        commentary,
        analyzed_at: new Date().toISOString(),
      });

      // Rate limiting: wait a bit between API calls
      if (i < newStars.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Combine and sort (newest first)
    const allAnalyzedStars = [...analyzedNewStars, ...existingStars].sort((a, b) =>
      new Date(b.starred_at).getTime() - new Date(a.starred_at).getTime()
    );

    // Save updated data
    await saveAnalyzedStars(allAnalyzedStars);

    console.log(`\n✅ Analysis complete! Total stars: ${allAnalyzedStars.length}`);
    console.log(`📝 Updated ${DATA_FILE}`);

    if (analyzedNewStars.length > 0) {
      console.log('\n🎯 Latest star:');
      console.log(`   ${analyzedNewStars[0].full_name}`);
      console.log(`   "${analyzedNewStars[0].commentary}"`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
