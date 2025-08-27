import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextInputBuilder,
  ModalBuilder,
  TextInputStyle,
} from "discord.js";

export function generateSubscriptionEmbed() {
  return new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle("🛒 Subscription Verification")
    .setDescription(
      "Click the button below to verify your stripe subscription and receive your role."
    );
}

export function generateVerifyButton() {
  const verifyButton = new ButtonBuilder()
    .setCustomId("verify_subscription")
    .setLabel("✅ Verify")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);
  return [row];
}

export function generateEmailModal() {
  const modal = new ModalBuilder()
    .setCustomId("verify_email_modal")
    .setTitle("Verify Your Subscription");

  const emailInput = new TextInputBuilder()
    .setCustomId("subscription_email")
    .setLabel("Enter your subscription email")
    .setPlaceholder("e.g. you@example.com")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
    emailInput
  );
  modal.addComponents(row);

  return modal;
}
