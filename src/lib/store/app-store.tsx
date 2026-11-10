import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { DEMO_APPLICATIONS, DEMO_DOCS, DEMO_STUDENT, BLANK_STUDENT } from "@/lib/data/student";
import { getScholarship } from "@/lib/data/scholarships";
import type { DocKey, DocStatus, Stage, StudentProfile } from "@/lib/types";

interface PersistedState {
  signedIn: boolean;
  profile: StudentProfile;
  applications: Record<string, Stage>;
  docs: Record<string, Partial<Record<DocKey, DocStatus>>>;
  essays: Record<string, string>;
  reminders: boolean;
}

interface AppStore extends PersistedState {
  hydrated: boolean;
  signInDemo: () => void;
  startFresh: () => void;
  signOut: () => void;
  resetDemo: () => void;
  updateProfile: (profile: StudentProfile) => void;
  saveScholarship: (id: string) => void;
  removeScholarship: (id: string) => void;
  moveApplication: (id: string, stage: Stage) => void;
  setDocStatus: (scholarshipId: string, doc: DocKey, status: DocStatus) => void;
  setEssay: (scholarshipId: string, text: string) => void;
  setReminders: (on: boolean) => void;
}

const STORAGE_KEY = "application-buddy:v1";

function demoState(signedIn: boolean): PersistedState {
  return {
    signedIn,
    profile: DEMO_STUDENT,
    applications: { ...DEMO_APPLICATIONS },
    docs: structuredClone(DEMO_DOCS),
    essays: {},
    reminders: true,
  };
}

const Ctx = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => demoState(false));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...demoState(false), ...(JSON.parse(raw) as Partial<PersistedState>) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const signInDemo = useCallback(() => setState(demoState(true)), []);
  const startFresh = useCallback(
    () => setState({ signedIn: true, profile: BLANK_STUDENT, applications: {}, docs: {}, essays: {}, reminders: true }),
    [],
  );
  const signOut = useCallback(() => setState(demoState(false)), []);
  const resetDemo = useCallback(() => setState(demoState(true)), []);
  const updateProfile = useCallback((profile: StudentProfile) => setState((s) => ({ ...s, profile })), []);

  const saveScholarship = useCallback((id: string) => {
    setState((s) => {
      if (s.applications[id]) return s;
      const sch = getScholarship(id);
      const docs = { ...s.docs };
      if (sch && !docs[id]) {
        docs[id] = Object.fromEntries(sch.requiredMaterials.map((k) => [k, "not-started" as DocStatus]));
      }
      return { ...s, applications: { ...s.applications, [id]: "saved" }, docs };
    });
  }, []);

  const removeScholarship = useCallback((id: string) => {
    setState((s) => {
      const applications = { ...s.applications };
      delete applications[id];
      return { ...s, applications };
    });
  }, []);

  const moveApplication = useCallback(
    (id: string, stage: Stage) => setState((s) => ({ ...s, applications: { ...s.applications, [id]: stage } })),
    [],
  );

  const setDocStatus = useCallback(
    (scholarshipId: string, doc: DocKey, status: DocStatus) =>
      setState((s) => ({ ...s, docs: { ...s.docs, [scholarshipId]: { ...s.docs[scholarshipId], [doc]: status } } })),
    [],
  );

  const setEssay = useCallback(
    (scholarshipId: string, text: string) => setState((s) => ({ ...s, essays: { ...s.essays, [scholarshipId]: text } })),
    [],
  );

  const setReminders = useCallback((on: boolean) => setState((s) => ({ ...s, reminders: on })), []);

  const value = useMemo<AppStore>(
    () => ({
      ...state,
      hydrated,
      signInDemo,
      startFresh,
      signOut,
      resetDemo,
      updateProfile,
      saveScholarship,
      removeScholarship,
      moveApplication,
      setDocStatus,
      setEssay,
      setReminders,
    }),
    [state, hydrated, signInDemo, startFresh, signOut, resetDemo, updateProfile, saveScholarship, removeScholarship, moveApplication, setDocStatus, setEssay, setReminders],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}
