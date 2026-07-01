import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

@modelOptions({ options: { customName: "video_only_users" } })
class videoOnlyUser {
  @prop({ required: true, unique: true })
  public discordUserId!: string;

  @prop({ required: true, unique: true })
  public stripeEmail!: string;

  @prop({ default: true })
  public active!: Boolean;

  @prop({ default: false })
  public oneMonthReminderSent!: Boolean;

  @prop({ default: false })
  public secondMonthReminderSent!: Boolean;

  @prop({ default: false })
  public thirdMonthReminderSent!: Boolean;
}

export const videoOnlyModel = getModelForClass(videoOnlyUser);
