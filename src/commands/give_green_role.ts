import { PermissionFlagsBits } from "discord.js";

import { extendedAPICommand } from "../utils/typings/types.js";
import { UserModel } from "../database/models/UserModel.js";

export default {
  name: "give_green_role",
  description: "Gives the greeb role to user if they have sub",
  permissionRequired: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "user",
      description: "The user to add the role to",
      type: 6, // USER type
      required: true,
    },
  ],
  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user")!;

    const doc = await UserModel.findOne({ discordUserId: targetMember.id });

    if (!doc) throw new Error("User doesnt seem to have subscription");

    const roleId = process.env.SUBSCRIBED_MEMBER_ROLE_ID;

    await targetMember.roles.add(roleId);

    await doc.updateOne({ shouldIgnoreInJob: false });

    await interaction.reply("✅ Role added!");
  },
} satisfies extendedAPICommand;
