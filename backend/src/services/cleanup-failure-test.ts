import { prisma } from "../database/prisma.js";

const campaignId = "cmsqcepgw0001a8nfgchy0kh7";
const senderId = "cmsqcepge0000a8nf17c4tsmh";

async function cleanup() {
  console.log("Cleaning failure-test data...");

  /*
   * Delete EmailJobs first because Sender has
   * onDelete: Restrict.
   */
  const deletedJobs =
    await prisma.emailJob.deleteMany({
      where: {
        campaignId,
      },
    });

  console.log(
    `Deleted EmailJobs: ${deletedJobs.count}`
  );

  /*
   * Delete the test campaign.
   */
  const deletedCampaign =
    await prisma.campaign.deleteMany({
      where: {
        id: campaignId,
      },
    });

  console.log(
    `Deleted Campaigns: ${deletedCampaign.count}`
  );

  /*
   * Now the sender is no longer referenced.
   */
  const deletedSender =
    await prisma.sender.deleteMany({
      where: {
        id: senderId,
      },
    });

  console.log(
    `Deleted Senders: ${deletedSender.count}`
  );

  console.log(
    "Failure-test cleanup completed."
  );
}

cleanup()
  .catch((error) => {
    console.error(
      "Cleanup failed:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });