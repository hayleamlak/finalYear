export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type AuthPayload = {
  userId: string;
  role: string;
};
