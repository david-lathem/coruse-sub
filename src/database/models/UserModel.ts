import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

@modelOptions({ options: { customName: "subscription_users" } })
class User {
  @prop({ required: true, unique: true })
  public discordUserId!: string;

  @prop({ required: true, unique: true })
  public stripeEmail!: string;

  @prop({ default: true })
  public hasSubActive!: Boolean;

  @prop({ default: false })
  public reminderSent?: Boolean;

  @prop({ default: false })
  public shouldIgnoreInJob?: Boolean;
}

export const UserModel = getModelForClass(User);
