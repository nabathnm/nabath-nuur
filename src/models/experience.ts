// Representasi data mentah dari tabel experiences di SQLite / Turso
export interface ExperienceRow {
  id: number;
  role: string;
  company: string;
  start: string;
  end: string;
  description: string;
  tasks: string; // Disimpan sebagai JSON string atau text di DB
}

// Representasi data bersih untuk konsumsi UI (setelah tasks diparse ke array)
export interface Experience {
  id: number;
  role: string;
  company: string;
  start: string;
  end: string;
  description: string;
  tasks: string[];
}
