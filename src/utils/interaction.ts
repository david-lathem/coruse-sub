import {
  BaseInteraction,
  InteractionReplyOptions,
  MessageFlags,
} from "discord.js";

export const handleInteractionError = async (
  interaction: BaseInteraction,
  error: Error
) => {
  console.log(error);
  try {
    const content = `Err! \`${error.message}\``;
    const reply: InteractionReplyOptions = {
      content,
      flags: MessageFlags.Ephemeral,
    };

    if (
      !interaction.isChatInputCommand() &&
      !interaction.isMessageComponent() &&
      !interaction.isModalSubmit()
    )
      return;

    if (interaction.deferred || interaction.replied)
      await interaction.editReply(content);
    else await interaction.reply(reply);
  } catch (error) {
    console.log(error);
  }
};
