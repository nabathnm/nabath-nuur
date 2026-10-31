import { useState, useEffect } from 'react';
import type { Experience } from '../models/experience';
import { experienceService } from '../services/experienceService';

export const FALLBACK_EXPERIENCES: Experience[] = [
  {
    id: 1,
    role: 'Mobile Engineer',
    company: 'Raion Community',
    type: 'Organization',
    location: 'Universitas Brawijaya',
    start: '2026',
    end: 'Present',
    description:
      'Developing mobile applications and collaborating with product, UI/UX, and backend teams to deliver functional and responsive experiences.',
    image:
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
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
    type: 'Organization',
    location: 'Universitas Brawijaya',
    start: '2026',
    end: 'Present',
    description:
      'Working on the Raion web platform by developing frontend interfaces and collaborating with backend, product, and UI/UX teams.',
    image:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
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
    type: 'Academic',
    location: 'Universitas Brawijaya',
    start: '2026',
    end: 'Present',
    description:
      'Assisting students in understanding algorithm and data structure concepts through practical sessions and hands-on programming exercises.',
    image:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop',
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
    type: 'Organization',
    location: 'Universitas Brawijaya',
    start: '2025',
    end: '2026',
    description:
      'Contributing to communication and public relations activities within the organization.',
    image:
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop',
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

