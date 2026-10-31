import { turso } from '../lib/turso';
import type { Experience, ExperienceRow } from '../models/experience';

// Helper untuk memetakan baris database ke interface Experience
function mapRowToExperience(row: any): Experience {
  const raw = row as ExperienceRow;
  let parsedTasks: string[] = [];

  try {
    parsedTasks =
      typeof raw.tasks === 'string'
        ? JSON.parse(raw.tasks || '[]')
        : Array.isArray(raw.tasks)
        ? raw.tasks
        : [];
  } catch (e) {
    console.warn(`Failed to parse tasks for experience id ${raw.id}:`, e);
    parsedTasks = [];
  }

  return {
    id: Number(raw.id),
    role: raw.role,
    company: raw.company,
    type: raw.type,
    location: raw.location,
    start: raw.start,
    end: raw.end,
    description: raw.description,
    image: raw.image_url ?? undefined,
    tasks: parsedTasks,
  };
}

export const experienceService = {
  // Mengambil seluruh daftar experience dari Turso
  async getAllExperiences(): Promise<Experience[]> {
    try {
      const result = await turso.execute('SELECT * FROM experiences ORDER BY id ASC');
      return result.rows.map(mapRowToExperience);
    } catch (error) {
      console.error('Error fetching experiences from Turso:', error);
      throw error;
    }
  },

  // Mengambil detail satu experience berdasarkan ID
  async getExperienceById(id: number | string): Promise<Experience | null> {
    try {
      const result = await turso.execute({
        sql: 'SELECT * FROM experiences WHERE id = ?',
        args: [id],
      });

      if (result.rows.length === 0) return null;
      return mapRowToExperience(result.rows[0]);
    } catch (error) {
      console.error(`Error fetching experience with id ${id}:`, error);
      throw error;
    }
  },
};

