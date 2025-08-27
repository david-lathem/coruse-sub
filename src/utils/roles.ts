import { GuildMember } from "discord.js";

export const hasPermanentRole = (member: GuildMember) =>
  member.roles.cache.has(process.env.PERMANENT_MEMBER_ROLE_ID);

export const removeSubscriptionRoleIfExists = async (member: GuildMember) => {
  if (!member.roles.cache.has(process.env.SUBSCRIBED_MEMBER_ROLE_ID)) return;

  await member.roles.add(process.env.FREE_MEMBER_ROLE_ID);

  await member.roles.remove(process.env.SUBSCRIBED_MEMBER_ROLE_ID);
  return true;
};

export const addSubscriptionRoleIfNotExists = async (member: GuildMember) => {
  if (member.roles.cache.has(process.env.SUBSCRIBED_MEMBER_ROLE_ID)) return;

  await member.roles.remove(process.env.FREE_MEMBER_ROLE_ID);
  await member.roles.add(process.env.SUBSCRIBED_MEMBER_ROLE_ID);
  return true;
};
