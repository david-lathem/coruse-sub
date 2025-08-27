import { PermissionFlagsBits } from "discord.js";

import { MESSAGE_CONFIG } from "../utils/constants.js";
import { extendedAPICommand } from "../utils/typings/types.js";

export default {
  name: "give_permanent_role",
  description: "Gives a permanent role to a user and sends them a DM",
  permissionRequired: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "user",
      description: "The user to give the permanent role to",
      type: 6, // USER type
      required: true,
    },
  ],
  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user")!;

    const roleId = process.env.PERMANENT_MEMBER_ROLE_ID;

    await targetMember.roles.add(roleId);

    // Send DM to the user
    await targetMember.send(MESSAGE_CONFIG.PERM_ROLE_ADD).catch(console.log);

    await interaction.reply("✅ Role given and DM sent!");
  },
} satisfies extendedAPICommand;
