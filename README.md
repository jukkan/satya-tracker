# 🎅 Satya Tracker

A satirical "Santa Tracker" style web app that monitors GitHub user [@saztd](https://github.com/saztd) (Satya Nadella's account) for new starred repositories and generates witty AI commentary on what each star reveals about Microsoft's CEO.

## 🌟 Features

- **Real-time Tracking**: Monitors Satya's GitHub stars every 6 hours via GitHub Actions
- **AI Commentary**: Uses Anthropic's Claude to generate playful, satirical analysis of each starred repo
- **Santa Tracker Aesthetic**: Dark theme with festive animations and a blinking "LIVE" indicator
- **Statistics Dashboard**:
  - Total stars tracked
  - Stars this week
  - Mood inference based on recent starring patterns
  - Top programming languages
- **Interactive Timeline**: Card-based view of all starred repos with full AI commentary
- **Fully Automated**: GitHub Actions handles data fetching, AI generation, and deployment

## 🚀 Live Demo

Once deployed, visit: `https://{your-username}.github.io/satya-tracker/`

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **AI**: Anthropic Claude API (Claude 3.5 Sonnet)
- **Automation**: GitHub Actions
- **Deployment**: GitHub Pages
- **Styling**: Custom CSS with dark theme and animations

## 📁 Project Structure

```
satya-tracker/
├── .github/workflows/
│   ├── fetch-stars.yml       # Cron job to fetch new stars (every 6 hours)
│   └── deploy.yml             # Deploy to GitHub Pages
├── scripts/
│   └── analyze-stars.ts       # Fetch stars + generate AI commentary
├── public/
│   └── data/
│       └── stars-analyzed.json    # Cached stars with AI commentary
├── src/
│   ├── App.tsx                # Main React component
│   ├── App.css                # Santa Tracker styling
│   ├── components/
│   │   ├── LatestStar.tsx     # Hero section with latest star
│   │   ├── Timeline.tsx       # Card-based timeline of all stars
│   │   └── Stats.tsx          # Statistics and mood inference
│   ├── types.ts               # TypeScript interfaces
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── index.html                 # HTML entry point
├── package.json               # Dependencies
├── vite.config.ts             # Vite configuration (GitHub Pages base path)
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 20+ and npm
- GitHub account
- Anthropic API key ([get one here](https://console.anthropic.com/))

### 1. Clone and Install

```bash
git clone https://github.com/{your-username}/satya-tracker.git
cd satya-tracker
npm install
```

### 2. Configure GitHub Secrets

Go to your repository settings → Secrets and variables → Actions, and add:

- **`ANTHROPIC_API_KEY`**: Your Anthropic API key for Claude
  - Get it from: https://console.anthropic.com/
  - Required for AI commentary generation

Note: `GITHUB_TOKEN` is automatically provided by GitHub Actions.

### 3. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Save

### 4. Update Base Path (if needed)

If your repo name is different from `satya-tracker`, update `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',  // Change this
})
```

And update the fetch URL in `src/App.tsx`:

```typescript
const response = await fetch('/your-repo-name/data/stars-analyzed.json');
```

### 5. Initial Data Population

The first time the workflow runs, it will:
1. Fetch all current stars from @saztd
2. Generate AI commentary for each one
3. Save to `public/data/stars-analyzed.json`
4. Trigger a deployment

You can manually trigger this by:
- Going to Actions → "Fetch and Analyze Stars" → "Run workflow"
- Or pushing to the main branch

## 🎮 Local Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run star analysis script manually
npm run analyze-stars
```

## 🤖 How It Works

### Automated Data Pipeline

1. **GitHub Actions Cron**: Every 6 hours, `fetch-stars.yml` workflow runs
2. **Fetch Stars**: Script calls GitHub API to get current starred repos
3. **Identify New Stars**: Compares with cached `public/data/stars-analyzed.json`
4. **Generate AI Commentary**: For each new star, calls Anthropic API with:
   - Repo name and description
   - Topics and language
   - Star count
5. **Update Cache**: Saves analyzed stars back to JSON file
6. **Commit & Deploy**: If changes detected, commits JSON and triggers deployment

### AI Commentary Prompt

The script sends this prompt to Claude for each new star:

```
Analyze this GitHub repository that Satya Nadella just starred:

Repo: {full_name}
Description: {description}
Topics: {topics}
Language: {language}
Stars: {stargazers_count}

Write 2-3 sentences of playful satirical commentary on what this star
reveals about Microsoft's CEO thinking. Reference Microsoft strategy
when relevant. Be witty but not mean. Keep it light and fun.
```

### Mood Inference

The Stats component analyzes recent starring patterns to infer "mood":

- **AI-Obsessed Mode**: Multiple AI/ML related repos
- **Cloud Infrastructure Mode**: Kubernetes, Docker, Azure topics
- **Security-Conscious**: Security, auth, encryption topics
- **Tooling Enthusiast**: Developer tools and productivity
- **Exploring**: Diverse interests

## 🎨 Customization

### Change Target User

Edit `scripts/analyze-stars.ts`:

```typescript
const GITHUB_USER = 'saztd';  // Change to any GitHub username
```

### Adjust Cron Schedule

Edit `.github/workflows/fetch-stars.yml`:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours (change as needed)
```

### Tune AI Model

Edit `scripts/analyze-stars.ts`:

```typescript
const message = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',  // Change model
  max_tokens: 200,                       // Adjust length
  messages: [...]
});
```

### Customize Styling

All styles are in `src/App.css`. Key CSS variables:

```css
:root {
  --bg-primary: #0a0e27;
  --accent-primary: #00d4ff;
  --accent-secondary: #7c3aed;
  /* ... */
}
```

## 📊 Data Format

`public/data/stars-analyzed.json` structure:

```json
[
  {
    "id": 123456789,
    "full_name": "owner/repo",
    "description": "A cool project",
    "html_url": "https://github.com/owner/repo",
    "stargazers_count": 1234,
    "language": "TypeScript",
    "topics": ["react", "vite"],
    "starred_at": "2025-01-01T12:00:00Z",
    "commentary": "AI-generated witty commentary here...",
    "analyzed_at": "2025-01-01T12:05:00Z"
  }
]
```

## 🐛 Troubleshooting

### No stars showing up?

- Check that `public/data/stars-analyzed.json` has content
- Verify GitHub Actions workflow ran successfully
- Check Actions logs for errors

### AI commentary not generating?

- Verify `ANTHROPIC_API_KEY` is set in repository secrets
- Check you have API credits in your Anthropic account
- Review workflow logs for API errors

### GitHub Pages not deploying?

- Ensure Pages is enabled and set to "GitHub Actions" source
- Check deploy workflow logs
- Verify `base` path in `vite.config.ts` matches repo name

### Rate limiting?

- The script includes 1-second delays between API calls
- GitHub provides higher rate limits when using `GITHUB_TOKEN`
- Anthropic has rate limits - adjust cron frequency if needed

## 📝 License

This is a satirical project for entertainment and educational purposes. Not affiliated with Microsoft, Satya Nadella, or GitHub.

## 🤝 Contributing

Contributions welcome! Feel free to:

- Add new mood inference patterns
- Improve AI prompts
- Enhance UI/UX
- Add more statistics
- Fix bugs

## 🙏 Acknowledgments

- Inspired by Google's Santa Tracker
- Powered by [Anthropic's Claude](https://www.anthropic.com/)
- Built with [Vite](https://vitejs.dev/) and [React](https://react.dev/)
- Deployed on [GitHub Pages](https://pages.github.com/)

---

Made with 🎅 and ☕ | [Report Issues](https://github.com/{your-username}/satya-tracker/issues)
