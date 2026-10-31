import { useState, useEffect } from 'react';
import type { Project } from '../models/project';
import { projectService } from '../services/projectService';

// Hook untuk mengambil semua data project
export function useProjects(_p0?: number) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await projectService.getAllProjects();
        setProjects(data);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat daftar project');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return { projects, loading, error };
}

// Hook untuk mengambil detail satu project berdasarkan ID
export function useProjectDetail(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadProject() {
      try {
        setLoading(true);
        const data = await projectService.getProjectById(id);
        setProject(data);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat detail project');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [id]);

  return { project, loading, error };
}