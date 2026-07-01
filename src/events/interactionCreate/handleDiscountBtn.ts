import { BaseInteraction, MessageFlags } from "discord.js";
import { handleInteractionError } from "../../utils/interaction.js";
import { generateEmailModal } from "../../utils/components.js";
import { searchStripeCustomersByEmail } from "../../stripe/functions.js";
import { getAnyActiveSession } from "../../utils/misc.js";
import { videoOnlyModel } from "../../database/models/videoOnlyModel.js";

export default async (interaction: BaseInteraction) => {
  try {
    if (!interaction.isButton()) return;

    const [customId, userId] = interaction.customId.split("_");

    if (customId !== "discount") return;

    const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID);

    if (!guild) return console.error("Guild not found in discount btn click");

    const member = await guild.members.fetch("987100475453231135");

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const user = await videoOnlyModel.findOne({
      discordUserId: interaction.user.id,
    });

    if (!user) return;
    const customers = await searchStripeCustomersByEmail(user.stripeEmail); // customer array will be empty if deleted customer

    // 2. Check if user is currently in era where he bought the video only (3months access), also works if user bought then expired then months later bought on same email
    const activeSession = await getAnyActiveSession(customers, true);
    await member.send(
      `<@${userId}> (${user.stripeEmail}) (${activeSession ? "Within 3 months" : "Outside of 3 months"})would like to upgrade, please give them the discount code!`,
    );

    await interaction.editReply("Request Sent");
  } catch (error) {
    console.error(error);
  }
};
