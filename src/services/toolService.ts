import { turso } from '../lib/turso';
import type { Tool } from '../models/tool';

export const toolService = {
  // Mengambil semua data tools
  async getAllTools(): Promise<Tool[]> {
    try {
      const result = await turso.execute('SELECT * FROM tools ORDER BY id ASC');
      // Type casting langsung karena nama kolom di DB sama persis dengan properti di model
      return result.rows as unknown as Tool[];
    } catch (error) {
      console.error('Error fetching tools:', error);
      throw error;
    }
  },

  // (Opsional) Mengambil data tools berdasarkan kategori tertentu
  async getToolsByCategory(category: string): Promise<Tool[]> {
    try {
      const result = await turso.execute({
        sql: 'SELECT * FROM tools WHERE category = ? ORDER BY id ASC',
        args: [category],
      });
      return result.rows as unknown as Tool[];
    } catch (error) {
      console.error(`Error fetching tools in category ${category}:`, error);
      throw error;
    }
  }
};