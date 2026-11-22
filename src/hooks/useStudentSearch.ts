'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getStudents } from '@/lib/api';
import type { Student } from '@/types/student';

const MAX_QUERY_LENGTH = 100;
const QUERY_TOO_LONG_MESSAGE = 'Search is limited to 100 characters.';
const LOAD_FAILED_MESSAGE = 'Could not load students. Please try again.';

export interface UseStudentSearchResult {
  students: Student[];
  query: string;
  setQuery: (value: string) => void;
  queryError: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function sortByName(list: Student[]): Student[] {
  return [...list].sort((a, b) =>
    (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' }),
  );
}

export function useStudentSearch(): UseStudentSearchResult {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef<boolean>(true);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getStudents();
      if (!mountedRef.current) return;
      const safeList = Array.isArray(result) ? result : [];
      setAllStudents(sortByName(safeList));
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error && err.message ? err.message : LOAD_FAILED_MESSAGE);
      setAllStudents([]);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  const queryError = query.length > MAX_QUERY_LENGTH ? QUERY_TOO_LONG_MESSAGE : null;

  const students = useMemo<Student[]>(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return allStudents;
    return allStudents.filter((student) =>
      (student.name ?? '').toLowerCase().includes(needle),
    );
  }, [allStudents, query]);

  const refetch = useCallback(async (): Promise<void> => {
    await load();
  }, [load]);

  return {
    students,
    query,
    setQuery,
    queryError,
    isLoading,
    error,
    refetch,
  };
}

export default useStudentSearch;