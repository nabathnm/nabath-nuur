import { useState, useEffect } from 'react';
import type { Tool } from '../models/tool';
import { toolService } from '../services/toolService';

// Hook untuk mengambil data tools langsung dari tabel `tools` di database Turso
export function useTools(category?: string) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTools() {
      try {
        setLoading(true);
        let data: Tool[];
        
        if (category) {
          data = await toolService.getToolsByCategory(category);
        } else {
          data = await toolService.getAllTools();
        }
        
        setTools(data || []);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data tools dari database Turso');
      } finally {
        setLoading(false);
      }
    }

    loadTools();
  }, [category]);

  return { tools, loading, error };
}
