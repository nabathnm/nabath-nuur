// Representasi data mentah sesuai skema SQLite/Turso
export interface ProjectRow {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string;     // Disimpan sebagai JSON string di DB
  tech_stack: string;   // Disimpan sebagai JSON string di DB
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  created_at: string;
}

// Representasi data bersih untuk konsumsi UI (setelah JSON diparse)
export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  techStack: string[];
  imageUrl: string | null;
  demoUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
}