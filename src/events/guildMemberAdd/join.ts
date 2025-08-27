import { GuildMember } from "discord.js";

export default async (member: GuildMember) =>
  await member.roles.add(process.env.FREE_MEMBER_ROLE_ID).catch(console.error);
