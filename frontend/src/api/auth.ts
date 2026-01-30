import { api } from "./client";

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export async function login(username: string, password: string) {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });
  return data;
}
