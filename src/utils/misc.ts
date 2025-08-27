import Stripe from "stripe";
import { getCustomerFullAccessSession } from "../stripe/functions.js";

export const getAnyActiveSession = async (
  customers: Stripe.Customer[]
): Promise<Stripe.Checkout.Session | undefined> => {
  const sessions = await Promise.all(
    customers.map((c) => getCustomerFullAccessSession(c.id))
  ); // get each checkout session for full access product for each customer id since only one is created

  // we verify here if 3 months have been passed since he bought this

  // Define 3 months in milliseconds (approx 30 days per month)
  let threeMonths = 1000 * 60 * 60 * 24 * 30 * 3;

  if (process.env.NODE_ENV === "development") threeMonths = 1000 * 60 * 5; // 5 minutes

  // Check if any session that was bought within last 3 months
  const activeSession = sessions.find(
    (s) => s && Date.now() - s.created * 1000 < threeMonths
  );

  return activeSession;
};
