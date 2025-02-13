'use server';

import Stripe from 'stripe';
import { stripe } from './config';
import { createClient } from '../supabase/server';
import { confirmReservation, createOrRetrieveCustomer, cancelReservation } from '../supabase/admin';
import { Tables } from '@/types/definitions';
import { getErrorRedirect, getURL } from '@/helpers/misc';

type CheckoutResponse = {
  // errorRedirect?: string;
  errorMessage?: string;
  sessionId?: string;
  paymentIntentId?: string;
};

type Event = Tables<'events'>;

export async function checkoutWithStripe(
  price: Event['price_stripe_id'],
  quantity: number = 1,
  reservationId: string,
  redirectPath: string = '/account'
): Promise<CheckoutResponse> {
  try {
    // Get the user from Supabase auth
    const supabase = createClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error(error);
      throw new Error('Could not get user session.');
    }

    // Retrieve or create the customer in Stripe
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user?.id || '',
        email: user?.email || '',
      });
    } catch (err) {
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    let params: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      expires_at: Math.floor(Date.now() / 1000) + 1800, // Set expiration time to 30 minutes from now
      invoice_creation: {
        enabled: true,
      },
      allow_promotion_codes: true,
      customer,
      customer_update: {
        address: 'auto',
      },
      metadata: {
        reservation_id: reservationId,
      },
      line_items: [
        {
          price: price || undefined,
          quantity,
        },
      ],
      payment_intent_data: {
        receipt_email: user.email,
      },
      cancel_url: getURL(),
      success_url: getURL(redirectPath),
    };

    // Create a checkout session in Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create(params);
    } catch (err) {
      console.error(err);
      throw new Error('Unable to create checkout session.');
    }

    // Instead of returning a Response, just return the data or error.
    if (session) {
      return { sessionId: session.id, paymentIntentId: session.payment_intent };
    } else {
      throw new Error('Unable to create checkout session.');
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorMessage: error.message,
      };
      // return {
      //   errorRedirect: getErrorRedirect(
      //     currentPath,
      //     error.message,
      //   )
      // };
    } else {
      return {
        errorMessage: 'An unknown error occurred.',
      };
      // return {
      //   errorRedirect: getErrorRedirect(
      //     currentPath,
      //     'An unknown error occurred.',
      //   )
      // };
    }
  }
}

export async function createStripePortal(currentPath: string) {
  try {
    const supabase = createClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (error) {
        console.error(error);
      }
      throw new Error('Could not get user session.');
    }

    let customer;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user.id || '',
        email: user.email || '',
      });
    } catch (err) {
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    if (!customer) {
      throw new Error('Could not get customer.');
    }

    try {
      const { url } = await stripe.billingPortal.sessions.create({
        customer,
        return_url: getURL('/account'),
      });
      if (!url) {
        throw new Error('Could not create billing portal');
      }
      return url;
    } catch (err) {
      console.error(err);
      throw new Error('Could not create billing portal');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return getErrorRedirect(currentPath, error.message);
    } else {
      return getErrorRedirect(currentPath, 'An unknown error occurred.');
    }
  }
}

export async function fulfillOrder(session: Stripe.Checkout.Session) {
  if (session?.payment_intent && session?.metadata?.reservation_id) {
    let receiptUrl: string | null = null;
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string, {
        expand: ['latest_charge'],
      });
      const latestCharge = paymentIntent.latest_charge as Stripe.Charge;
      receiptUrl = latestCharge?.receipt_url || null;
    } catch (error) {
      console.error('Failed to retrieve payment intent for receipt:', error);
    }

    // Confirm the reservation
    await confirmReservation(
      session.metadata.reservation_id,
      session.payment_intent as string,
      receiptUrl,
      session.amount_total || 0,
      session.currency || 'sgd'
    );
  } else {
    console.log('No payment intent found in checkout session. Unable to fulfill order.');
  }
}

/**
 * Refunds a Stripe payment intent and updates the event_reservations record in Supabase.
 * @param paymentIntentId - The ID of the Stripe payment intent to refund.
 * @param reservationId - The ID of the reservation in the event_reservations table.
 */
export const refundPayment = async (paymentIntentId: string, reservationId: string) => {
  try {
    // Refund the Stripe payment intent
    const refund: Stripe.Refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    if (!refund) {
      throw new Error('Failed to create refund.');
    }

    await cancelReservation(reservationId);

    return refund;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Error processing refund and updating reservation: ${error.message}`);
  }
};
