import { Client, MessageCreateOptions } from "discord.js";
import { UserModel } from "../database/models/UserModel.js";
import {
  getCustomerActiveSubscriptions,
  searchStripeCustomersByEmail,
} from "../stripe/functions.js";
import {
  addSubscriptionRoleIfNotExists,
  addVideoRoleIfNotExists,
  hasPermanentRole,
  removeSubscriptionRoleIfExists,
  removeVideoRoleIfExists,
} from "./roles.js";
import { getAnyActiveSession } from "./misc.js";
import Stripe from "stripe";
import { MESSAGE_CONFIG } from "./constants.js";
import { videoOnlyModel } from "../database/models/videoOnlyModel.js";
import { generateDiscountButton } from "./components.js";

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
          customers.map((c) => getCustomerActiveSubscriptions(c.id)),
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

        let reminderTime = 1000 * 60 * 60 * 24 * 83;

        if (process.env.NODE_ENV === "development")
          reminderTime = 1000 * 60 * 5;

        const shouldSendReminder =
          Date.now() - (activeSession?.created ?? 0) * 1000 >= reminderTime;

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

export const checkCustomerVideoOnly = async (client: Client<true>) => {
  console.log(`${new Date()}: Running Video Only Job!`);

  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  if (!guild) return console.error("Guild not found");

  const users = await videoOnlyModel.find().catch(console.error);

  for (const user of users ?? []) {
    try {
      const userOldSubStatus = user.active;
      let hasFinished: boolean = true; // we assume it is at start, below, it might prove us wrong

      // 1. Get all customers for user email

      const customers = await searchStripeCustomersByEmail(user.stripeEmail); // customer array will be empty if deleted customer, so hasFinished def true

      // 2. Check if user is currently in era where he bought the video only (3months access), also works if user bought then expired then months later bought on same email
      const activeSession = await getAnyActiveSession(customers, true);

      if (activeSession) hasFinished = false;

      // keep updating in database even if user left server or some shi
      await user.updateOne({ active: !hasFinished });

      const member = await guild.members
        .fetch(user.discordUserId)
        .catch(console.log);

      if (!member) continue;

      let reply: MessageCreateOptions = {
        content: "",
        components: generateDiscountButton(user.discordUserId),
      };

      if (hasFinished) {
        await removeVideoRoleIfExists(member);

        if (userOldSubStatus)
          reply.content = MESSAGE_CONFIG.VIDEO_ONLY_FINISHED; // means, user had active sub but then now has sub finished
      }

      if (!hasFinished) {
        await addVideoRoleIfNotExists(member);

        let reminderTime = 1000 * 60 * 60 * 24 * 29;

        if (process.env.NODE_ENV === "development")
          reminderTime = 1000 * 60 * 1;

        const shouldSendReminder = (month: number) =>
          Date.now() - (activeSession?.created ?? 0) * 1000 >=
          reminderTime * month;

        const hasSentFirstMonthReminder = user.oneMonthReminderSent;

        console.log(hasSentFirstMonthReminder);

        const hasSentSecondMonthReminder = user.secondMonthReminderSent;

        console.log(hasSentSecondMonthReminder);

        if (!user.oneMonthReminderSent && shouldSendReminder(1)) {
          reply.content = MESSAGE_CONFIG.VIDEO_ONLY_REMINDER;

          await user.updateOne({ oneMonthReminderSent: true });
        }

        console.log(user.oneMonthReminderSent);

        if (
          user.oneMonthReminderSent &&
          !user.secondMonthReminderSent &&
          shouldSendReminder(2)
        ) {
          reply.content = MESSAGE_CONFIG.VIDEO_ONLY_REMINDER;
          await user.updateOne({ secondMonthReminderSent: true });
        }

        if (
          user.secondMonthReminderSent &&
          !user.thirdMonthReminderSent &&
          shouldSendReminder(3)
        ) {
          reply.content = MESSAGE_CONFIG.VIDEO_ONLY_REMINDER;
          await user.updateOne({ thirdMonthReminderSent: true });
        }
      }

      if (reply.content) await member.send(reply).catch(console.error);

      console.log(hasFinished);
    } catch (error) {
      console.error(error);
    }
  }
};
