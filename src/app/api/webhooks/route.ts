import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import { cancelReservation, refundReservationWithPaymentIntent } from '@/utils/supabase/admin';
import { fulfillOrder } from '@/utils/stripe/server';

const relevantEvents = new Set([
  'checkout.session.completed',
  'checkout.session.expired',
  'checkout.session.async_payment_succeeded',
  'charge.refunded',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) return new Response('Webhook secret not found.', { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      let charge: Stripe.Charge;
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          // Save an order in database, marked as 'awaiting payment'

          // Check if the order is paid (for example, from a card payment)
          //
          // A delayed notification payment will have an `unpaid` status, as
          // you're still waiting for funds to be transferred from the customer's
          // account.
          if (session.payment_status === 'paid') {
            fulfillOrder(session);
          }

          break;
        }

        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session;
          // Cancel the reservation
          if (session.metadata?.reservation_id) {
            cancelReservation(session.metadata.reservation_id);
          }
          break;
        }

        case 'checkout.session.async_payment_succeeded': {
          const session = event.data.object as Stripe.Checkout.Session;
          // Fulfill the order
          fulfillOrder(session);

          break;
        }

        case 'charge.refunded': {
          charge = event.data.object as Stripe.Charge;
          // Update reservation status
          if (charge.payment_intent) {
            refundReservationWithPaymentIntent(charge.payment_intent as string);
          }

          break;
        }

        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new Response('Webhook handler failed. View your Next.js function logs.', {
        status: 400,
      });
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400,
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
