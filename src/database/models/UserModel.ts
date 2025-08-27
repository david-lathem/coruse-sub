import { prop, getModelForClass } from "@typegoose/typegoose";

class User {
  @prop({ required: true, unique: true })
  public discordUserId!: string;

  @prop({ required: true, unique: true })
  public stripeEmail!: string;

  @prop({ default: true })
  public hasSubActive!: Boolean;
}

export const UserModel = getModelForClass(User);
