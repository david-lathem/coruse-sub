import { BaseInteraction, MessageFlags } from "discord.js";
import { handleInteractionError } from "../../utils/interaction.js";
import { generateEmailModal } from "../../utils/components.js";
import {
  getCustomerFullAccessSession,
  searchStripeCustomersByEmail,
} from "../../stripe/functions.js";
import { UserModel } from "../../database/models/UserModel.js";
import { getAnyActiveSession } from "../../utils/misc.js";

export default async (interaction: BaseInteraction) => {
  try {
    // --- 1. Button Interaction: Show Modal ---
    if (
      interaction.isButton() &&
      interaction.customId === "verify_subscription"
    ) {
      const modal = generateEmailModal();

      await interaction.showModal(modal);
    }

    // --- 2. Modal Submission: Handle Email ---
    if (
      interaction.inCachedGuild() &&
      interaction.isModalSubmit() &&
      interaction.customId === "verify_email_modal"
    ) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const email = interaction.fields.getTextInputValue("subscription_email");

      const alreadyExistInDb = await UserModel.exists({ stripeEmail: email });

      if (alreadyExistInDb)
        throw new Error("Someone has already verified using that email");

      const customers = await searchStripeCustomersByEmail(email); // get all customers created for a email (through one time purchase or sub)

      if (!customers.length)
        throw new Error(`No customer found with the email ${email}`);

      const activeSession = await getAnyActiveSession(customers);

      if (!activeSession)
        throw new Error(
          `You have either not bought our course yet or 3 months have been passed since you bought it.`
        );

      await interaction.member.roles.add(process.env.SUBSCRIBED_MEMBER_ROLE_ID);
      await interaction.member.roles.remove(process.env.FREE_MEMBER_ROLE_ID);

      await UserModel.findOneAndUpdate(
        { discordUserId: interaction.user.id },
        {
          discordUserId: interaction.user.id,
          stripeEmail: email,
        },
        { upsert: true }
      ); // in case user signed up with one email first then later bought subscription and access using another email so bot updates

      await interaction.editReply(
        `🎉 你已成功驗證並開通「市場解剖師」身份，歡迎進入核心學習區域！`
      );
    }
  } catch (error) {
    if (error instanceof Error) handleInteractionError(interaction, error);
  }
};
