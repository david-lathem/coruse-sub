declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      MONGO_URI: string;
      NODE_ENV: "development" | "production";

      GUILD_ID: string;

      STRIPE_API_KEY: string;
      FULL_ACCESS_PAYMENT_LINK: string;
      ONE_MONTH_LINK: string;
      THREE_MONTH_LINK: string;

      FREE_MEMBER_ROLE_ID: string;
      SUBSCRIBED_MEMBER_ROLE_ID: string;
      PERMANENT_MEMBER_ROLE_ID: string;
    }
  }
}

// // If this file has no import/export statements (i.e. is a script)
// // convert it into a module by adding an empty export statement.
export {};
