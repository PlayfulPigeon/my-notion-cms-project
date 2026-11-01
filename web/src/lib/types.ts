export type Post = {
  id: string;
  slug: string;
  title: string;
  type: "Devlog" | "Project";
  summary: string;
  publishedAt: string; // ISO date
  cover?: string;
  genre: string[];
  engineVersion?: string;
  tags: string[];
  playUrl?: string;
  repoUrl?: string;
};
