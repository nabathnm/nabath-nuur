import { turso } from '../lib/turso';
import type { Project, ProjectRow } from '../models/project';

// Helper untuk memetakan baris database ke interface Project
function mapRowToProject(row: any): Project {
  const raw = row as ProjectRow;
  return {
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle,
    description: raw.description,
    features: JSON.parse(raw.features || '[]'),
    techStack: JSON.parse(raw.tech_stack || '[]'),
    imageUrl: raw.image_url,
    demoUrl: raw.demo_url,
    githubUrl: raw.github_url,
    createdAt: raw.created_at,
  };
}

export const projectService = {
  // Mengambil seluruh daftar project (Read All)
  async getAllProjects(): Promise<Project[]> {
    try {
      const result = await turso.execute('SELECT * FROM projects ORDER BY created_at DESC');
      return result.rows.map(mapRowToProject);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Mengambil detail satu project berdasarkan ID (Read By ID)
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const result = await turso.execute({
        sql: 'SELECT * FROM projects WHERE id = ?',
        args: [id],
      });
      
      if (result.rows.length === 0) return null;
      return mapRowToProject(result.rows[0]);
    } catch (error) {
      console.error(`Error fetching project with id ${id}:`, error);
      throw error;
    }
  },
};