// Database types for Supabase tables

// =====================
// PROFILE
// =====================
export interface Profile {
  id: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  auth_user_id: string | null;
  name: string | null;
  email: string | null;
  user_roles: string | null;
  position: string | null;
  is_active: boolean | null;
  last_login: string | null;
  rumah_quran_id: number | null;
  birthdate: string | null;
  birthplace: string | null;
  address: string | null;
  phone_number: string | null;
}

export type ProfileInsert = Omit<Profile, "id" | "created_at"> & {
  created_at?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, "id">> & {
  id: number;
};

// =====================
// RUMAH QURAN
// =====================
export interface RumahQuran {
  id: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  code: string | null;
  name: string | null;
  address: string | null;
  location: string | null;
  is_active: boolean | null;
}

export type RumahQuranInsert = Omit<RumahQuran, "id" | "created_at"> & {
  created_at?: string;
};

export type RumahQuranUpdate = Partial<Omit<RumahQuran, "id">> & {
  id: number;
};

// =====================
// WORK PROGRAM SUBMISSION
// =====================
export interface WorkProgramSubmission {
  id: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  submitted_by: number | null;
  rumah_quran_id: number | null;
  name: string | null;
  type: string | null;
  description: string | null;
  estimated_audience_number: number | null;
  actual_audience_number: number | null;
  submitted_start_date: string | null;
  submitted_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  submitted_duration: number | null;
  actual_duration: number | null;
  submitted_cost: number | null;
  approved_cost: number | null;
  submission_status: string | null;
  is_verified_by_director: boolean | null;
}

export type WorkProgramSubmissionInsert = Omit<
  WorkProgramSubmission,
  "id" | "created_at"
> & {
  created_at?: string;
};

export type WorkProgramSubmissionUpdate = Partial<
  Omit<WorkProgramSubmission, "id">
> & {
  id: number;
};

// =====================
// AUTH USER (for context)
// =====================
export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}
