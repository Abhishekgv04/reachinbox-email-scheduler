import api from "./api";

export async function getDashboardCampaigns(
  userId
) {
  const response = await api.get(
    "/campaigns",
    {
      params: {
        userId,
      },
    }
  );

  return response.data.campaigns || [];
}