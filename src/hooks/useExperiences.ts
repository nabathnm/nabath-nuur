import { useState, useEffect } from 'react';
import type { Experience } from '../models/experience';
import { experienceService } from '../services/experienceService';

export const FALLBACK_EXPERIENCES: Experience[] = [
  {
    id: 1,
    role: 'Mobile Engineer',
    company: 'Raion Community',
    start: '2026',
    end: 'Present',
    description:
      'Developing mobile applications and collaborating with product, UI/UX, and backend teams to deliver functional and responsive experiences.',
    tasks: [
      'Build mobile applications using Flutter',
      'Implement state management using Provider and BLoC',
      'Integrate REST APIs with mobile applications',
      'Translate UI/UX designs into responsive interfaces',
    ],
  },
  {
    id: 2,
    role: 'Frontend Developer',
    company: 'Raion Community',
    start: '2026',
    end: 'Present',
    description:
      'Working on the Raion web platform by developing frontend interfaces and collaborating with backend, product, and UI/UX teams.',
    tasks: [
      'Develop web interfaces using React and Next.js',
      'Build responsive UI with Tailwind CSS',
      'Integrate frontend with backend APIs',
      'Collaborate with backend and UI/UX teams',
    ],
  },
  {
    id: 3,
    role: 'Assistant Practicum',
    company: 'Faculty of Computer Science',
    start: '2026',
    end: 'Present',
    description:
      'Assisting students in understanding algorithm and data structure concepts through practical sessions and hands-on programming exercises.',
    tasks: [
      'Explain algorithm and data structure concepts',
      'Guide students during practical sessions',
      'Assist students with programming problems',
      'Prepare and demonstrate programming case studies',
    ],
  },
  {
    id: 4,
    role: 'Public Relations Staff',
    company: 'UKM Tapak Suci',
    start: '2025',
    end: '2026',
    description:
      'Contributing to communication and public relations activities within the organization.',
    tasks: [
      'Coordinate internal and external communication',
      'Support organizational events',
      'Assist promotional activities',
    ],
  },
];

export function useExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>(FALLBACK_EXPERIENCES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadExperiences() {
      try {
        setLoading(true);
        const data = await experienceService.getAllExperiences();
        if (data && data.length > 0) {
          setExperiences(data);
        }
      } catch (err: any) {
        console.warn('Using fallback experiences:', err.message);
        setError(err.message || 'Gagal memuat data experiences dari Turso');
      } finally {
        setLoading(false);
      }
    }

    loadExperiences();
  }, []);

  return { experiences, loading, error };
}
