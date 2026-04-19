import { create } from "zustand";

export type Role = "admin" | "student" | null;

interface StudentProfile {
  id: number;
  name: string;
  rollNumber: string;
  department: string;
}

interface AuthState {
  role: Role;
  studentProfile: StudentProfile | null;
  setRole: (role: Role) => void;
  setStudentProfile: (profile: StudentProfile | null) => void;
  logout: () => void;
}

// Load initial state from localStorage
const loadState = () => {
  try {
    const role = localStorage.getItem("dtect_role") as Role;
    const profileStr = localStorage.getItem("dtect_profile");
    const studentProfile = profileStr ? JSON.parse(profileStr) : null;
    return { role, studentProfile };
  } catch {
    return { role: null, studentProfile: null };
  }
};

const initialState = loadState();

export const useAuth = create<AuthState>((set) => ({
  role: initialState.role,
  studentProfile: initialState.studentProfile,
  setRole: (role) => {
    localStorage.setItem("dtect_role", role || "");
    set({ role });
  },
  setStudentProfile: (profile) => {
    if (profile) {
      localStorage.setItem("dtect_profile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("dtect_profile");
    }
    set({ studentProfile: profile });
  },
  logout: () => {
    localStorage.removeItem("dtect_role");
    localStorage.removeItem("dtect_profile");
    set({ role: null, studentProfile: null });
  },
}));
