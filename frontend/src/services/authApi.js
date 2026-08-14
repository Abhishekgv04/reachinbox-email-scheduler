import api from "./api";

export async function googleLogin(
  credential
) {
  const response = await api.post(
    "/auth/google",
    {
      credential,
    }
  );

  return response.data.user;
}