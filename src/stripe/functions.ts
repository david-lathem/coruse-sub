import Stripe from "stripe";
import stripe from "./index.js";

export const searchStripeCustomersByEmail = async (
  email: string,
): Promise<Stripe.Customer[]> => {
  const customers = await stripe.customers.search({
    query: `email:'${email}'`,
    limit: 100,
  });

  console.log(customers);

  return customers.data;
};

export const getCustomerFullAccessSession = async (
  customerId: string,
  videoOnly: Boolean = false,
): Promise<Stripe.Checkout.Session | undefined> => {
  const completedSessions = await stripe.checkout.sessions.list({
    payment_link: videoOnly
      ? process.env.VIDEO_ONLY_PAYMENT_LINK
      : process.env.FULL_ACCESS_PAYMENT_LINK,
    status: "complete",
    limit: 100,
  });

  const customerSession = completedSessions.data.find(
    (s) => s.customer === customerId,
  );

  return customerSession;
};

export const getCustomerActiveSubscriptions = async (
  customerId: string,
): Promise<Stripe.Subscription[]> => {
  const activeSubscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 100,
  });

  return activeSubscriptions.data;
};
