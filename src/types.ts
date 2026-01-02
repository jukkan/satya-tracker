export interface AnalyzedStar {
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

export interface BlogPost {
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
