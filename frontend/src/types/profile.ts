export type BackendLanguage = "ENGLISH" | "AMHARIC" | "AFAN_OROMO";

export type ProfileRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string | null;
  language: BackendLanguage;
  role: string;
  created_at: string | null;
  updated_at: string | null;
};

export type ProfileResponse = {
  success: boolean;
  data: {
    profile: ProfileRecord;
  };
};

export type UpdateProfilePayload = {
  first_name?: string;
  last_name?: string;
  address?: string | null;
  language?: BackendLanguage;
  email?: string;
};
