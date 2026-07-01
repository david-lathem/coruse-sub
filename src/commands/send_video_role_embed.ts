import { PermissionFlagsBits } from "discord.js";
import {
  generateVideoOnlyEmbed,
  generateVideoVerifyButton,
} from "../utils/components.js";
import { extendedAPICommand } from "../utils/typings/types.js";

export default {
  name: "send_video_role_embed",
  description: "Sends the verification embed with button for video role",
  permissionRequired: PermissionFlagsBits.Administrator,

  execute: async (interaction) => {
    const embed = generateVideoOnlyEmbed();
    const components = generateVideoVerifyButton();

    await interaction.reply("Sending");

    await interaction.deleteReply();

    await interaction.channel?.send({
      embeds: [embed],
      components: components,
    });
  },
} satisfies extendedAPICommand;
