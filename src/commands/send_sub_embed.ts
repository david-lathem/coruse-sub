import { PermissionFlagsBits } from "discord.js";
import {
  generateSubscriptionEmbed,
  generateVerifyButton,
} from "../utils/components.js";
import { extendedAPICommand } from "../utils/typings/types.js";

export default {
  name: "send_sub_embed",
  description: "Sends the subscription verification embed with button.",
  permissionRequired: PermissionFlagsBits.Administrator,

  execute: async (interaction) => {
    const embed = generateSubscriptionEmbed();
    const components = generateVerifyButton();

    await interaction.reply("Sending");

    await interaction.deleteReply();

    await interaction.channel?.send({
      embeds: [embed],
      components: components,
    });
  },
} satisfies extendedAPICommand;
