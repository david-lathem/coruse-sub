import { Client } from "discord.js";
import { UserModel } from "../database/models/UserModel.js";
import {
  getCustomerActiveSubscriptions,
  searchStripeCustomersByEmail,
} from "../stripe/functions.js";
import {
  addSubscriptionRoleIfNotExists,
  hasPermanentRole,
  removeSubscriptionRoleIfExists,
} from "./roles.js";
import { getAnyActiveSession } from "./misc.js";
import Stripe from "stripe";
import { MESSAGE_CONFIG } from "./constants.js";

export const checkCustomerSubscriptions = async (client: Client<true>) => {
  console.log(`${new Date()}: Running job!`);

  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  if (!guild) return console.error("Guild not found");

  const users = await UserModel.find().catch(console.error);

  for (const user of users ?? []) {
    try {
      if (user.shouldIgnoreInJob) continue;
      const userOldSubStatus = user.hasSubActive;
      let hasSubFinished: boolean = true; // we assume it is at start, below, it might prove us wrong

      // 1. Get all customers for user email

      const customers = await searchStripeCustomersByEmail(user.stripeEmail); // customer array will be empty if deleted customer, so hasSubFinished def true

      // 2. Check if user is currently in era where he bought the course (3months access)
      const activeSession = await getAnyActiveSession(customers);

      // perfekt, no need to check his subscription
      if (activeSession) hasSubFinished = false;

      // 3. If not active session found, get all subscriptions for each email and then get only that are active [maybe he has subscription now]

      if (!activeSession) {
        const allSubscriptions = await Promise.all(
          customers.map((c) => getCustomerActiveSubscriptions(c.id))
        );

        const allSubscriptionsFlatted = allSubscriptions.flat();

        let activeSubscription: Stripe.Subscription | undefined;

        // we tryna find the sub that has longest time (billing end date)
        for (const subscription of allSubscriptionsFlatted) {
          // first iteration
          if (!activeSubscription) {
            activeSubscription = subscription;
            continue;
          }

          // consecutive iteration
          if (
            subscription.items.data[0].current_period_end >
            activeSubscription.items.data[0].current_period_end
          )
            activeSubscription = subscription;
        }

        console.log(activeSubscription);

        hasSubFinished = !activeSubscription;
      }

      await user.updateOne({ hasSubActive: !hasSubFinished });

      const member = await guild.members
        .fetch(user.discordUserId)
        .catch(console.log);

      if (!member) continue;

      // If the guy has permanent role, dont touch him lol

      if (hasPermanentRole(member)) continue;

      let text: string = "";

      if (hasSubFinished) {
        await removeSubscriptionRoleIfExists(member);

        if (userOldSubStatus) text = MESSAGE_CONFIG.SUB_FINISHED; // means, before loop user had active sub but then now has sub finished
      }

      if (!hasSubFinished) {
        const roleAdded = await addSubscriptionRoleIfNotExists(member);

        if (!userOldSubStatus) text = MESSAGE_CONFIG.SUB_RENEWED;
        if (userOldSubStatus && roleAdded) text = MESSAGE_CONFIG.ROLE_ADDED; // if user had active sub before loop and now still active but role added

        let reminderTime = 1000 * 60 * 60 * 24 * 7;

        if (process.env.NODE_ENV === "development")
          reminderTime = 1000 * 60 * 5;

        const shouldSendReminder =
          Date.now() - (activeSession?.created ?? 0) * 1000 <= reminderTime;

        if (activeSession && !user.reminderSent && shouldSendReminder) {
          text = MESSAGE_CONFIG.REMINDER;
          await user.updateOne({ reminderSent: true });
        }
      }

      if (text) await member.send(text).catch(console.error);

      console.log(hasSubFinished);
    } catch (error) {
      console.error(error);
    }
  }
};
