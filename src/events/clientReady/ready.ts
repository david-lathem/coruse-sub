import { Client } from "discord.js";

import registerAndAttachCommandsOnClient from "../../utils/registrars/registerCommands.js";
import { checkCustomerSubscriptions } from "../../utils/jobs.js";
import { CronJob } from "cron";

export default async (client: Client<true>) => {
  console.log(`${client.user.username} (${client.user.id}) is ready 🐬`);
  await registerAndAttachCommandsOnClient(client);

  CronJob.from({
    cronTime: "0 */1 * * * *",
    start: true,
    onTick: () => checkCustomerSubscriptions(client),
  });
};
