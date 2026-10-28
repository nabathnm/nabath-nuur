import { useState, useEffect } from 'react';
import type { Tool } from '../models/tool';
import { toolService } from '../services/toolService';

// Hook menerima parameter opsional 'category'. 
// Jika diisi, akan mengambil tools sesuai kategori saja.
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
        
        setTools(data);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data tools');
      } finally {
        setLoading(false);
      }
    }

    loadTools();
  }, [category]); // Re-fetch data jika kategori berubah

  return { tools, loading, error };
}