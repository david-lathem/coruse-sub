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
      "Click the button below to verify your stripe subscription and receive your role.",
    );
}

export function generateVideoOnlyEmbed() {
  return new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle("🛒 Stripe Verification")
    .setDescription(
      "Click the button below to verify your stripe purchase and receive your role.",
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

export function generateVideoVerifyButton() {
  const verifyButton = new ButtonBuilder()
    .setCustomId("verify_video")
    .setLabel("✅ Verify")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);
  return [row];
}

export function generateEmailModal(customId = "verify_email_modal") {
  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle("Verify Your Subscription");

  const emailInput = new TextInputBuilder()
    .setCustomId("stripe_email")
    .setLabel("Enter your stripe email")
    .setPlaceholder("e.g. you@example.com")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
    emailInput,
  );
  modal.addComponents(row);

  return modal;
}

export function generateDiscountButton(userId: string) {
  const discountButton = new ButtonBuilder()
    .setCustomId(`discount_${userId}`)
    .setLabel("✅ Request for discount")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    discountButton,
  );
  return [row];
}
