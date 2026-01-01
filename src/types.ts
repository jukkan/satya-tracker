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
