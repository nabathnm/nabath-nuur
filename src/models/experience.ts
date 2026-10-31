// Representasi data mentah dari tabel experiences di SQLite / Turso
export interface ExperienceRow {
  id: number | string;
  role: string;
  company: string;
  type: string;
  location: string;
  start: string;
  end: string;
  description: string;
  image_url: string | null;
  tasks: string; // Disimpan sebagai JSON string di DB: '["...", "..."]'
}

// Representasi data bersih untuk konsumsi UI (setelah JSON diparse)
export interface Experience {
  id: number;
  role: string;
  company: string;
  type: string;
  location: string;
  start: string;
  end: string;
  description: string;
  image?: string;
  tasks: string[];
}

