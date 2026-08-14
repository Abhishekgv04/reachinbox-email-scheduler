import api from "./api";

export async function getSenders(userId) {
  const response = await api.get("/senders", {
    params: {
      userId,
    },
  });

  return response.data.senders;
}

export async function getSenderById(
  senderId,
  userId
) {
  const response = await api.get(
    `/senders/${senderId}`,
    {
      params: {
        userId,
      },
    }
  );

  return response.data.sender;
}

export async function createSender(
  senderData
) {
  const response = await api.post(
    "/senders",
    senderData
  );

  return response.data.sender;
}

export async function updateSender(
  senderId,
  userId,
  senderData
) {
  const response = await api.put(
    `/senders/${senderId}`,
    {
      ...senderData,
      userId,
    }
  );

  return response.data.sender;
}

export async function deleteSender(
  senderId,
  userId
) {
  const response = await api.delete(
    `/senders/${senderId}`,
    {
      data: {
        userId,
      },
    }
  );

  return response.data;
}

export async function testSmtpConnection(
  smtpData
) {
  const response = await api.post(
    "/senders/test-connection",
    smtpData
  );

  return response.data;
}

export async function testExistingSender(
  senderId,
  userId
) {
  const response = await api.post(
    `/senders/${senderId}/test-connection`,
    {
      userId,
    }
  );

  return response.data;
}