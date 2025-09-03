import { PermissionFlagsBits } from "discord.js";

import { extendedAPICommand } from "../utils/typings/types.js";
import { UserModel } from "../database/models/UserModel.js";

export default {
  name: "remove_green_role",
  description: "Removes the greeb role from user if they have sub",
  permissionRequired: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "user",
      description: "The user to remove the role from",
      type: 6, // USER type
      required: true,
    },
  ],
  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user")!;

    const doc = await UserModel.findOne({ discordUserId: targetMember.id });

    if (!doc) throw new Error("User doesnt seem to have subscription");

    const roleId = process.env.SUBSCRIBED_MEMBER_ROLE_ID;

    await targetMember.roles.remove(roleId);

    await doc.updateOne({ shouldIgnoreInJob: true });

    await interaction.reply("✅ Role removed!");
  },
} satisfies extendedAPICommand;
