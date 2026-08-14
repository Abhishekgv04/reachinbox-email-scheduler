import api from "./api";

export async function getCampaigns(userId) {
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

export async function getCampaignById(
  campaignId,
  userId
) {
  const response = await api.get(
    `/campaigns/${campaignId}`,
    {
      params: {
        userId,
      },
    }
  );

  return response.data.campaign;
}

export async function createCampaign(
  campaignData,
  userId
) {
  const response = await api.post(
    "/campaigns",
    {
      ...campaignData,
      userId,
    }
  );

  return response.data.campaign;
}

export async function startCampaign(
  campaignId,
  userId
) {
  const response = await api.post(
    `/campaigns/${campaignId}/start`,
    {
      userId,
    }
  );

  return response.data.campaign;
}

export async function cancelCampaign(
  campaignId,
  userId
) {
  const response = await api.post(
    `/campaigns/${campaignId}/cancel`,
    {
      userId,
    }
  );

  return response.data.campaign;
}