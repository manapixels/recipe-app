import { stripe } from '../stripe/config';
import { Database } from '@/types/definitions';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Updates the reservation status in Supabase after payment is confirmed.
 * @param reservationId - The ID of the reservation to update.
 * @param paymentIntentId - The ID of the Stripe payment intent.
 * @param amount - The amount of the reservation.
 * @param currency - The currency of the reservation.
 */
export const confirmReservation = async (
  reservationId: string,
  paymentIntentId: string,
  receiptUrl: string | null,
  amount: number,
  currency: string
) => {
  const { data, error } = await supabaseAdmin
    .from('event_reservations')
    .update({
      payment_status: 'paid',
      reservation_status: 'confirmed',
      payment_amount: amount,
      payment_currency: currency,
      stripe_payment_intent_id: paymentIntentId,
      stripe_receipt_url: receiptUrl,
    })
    .eq('id', reservationId);

  if (error) {
    console.error(`Failed to update reservation status: ${error.message}`);
    throw new Error(`Failed to update reservation status: ${error.message}`);
  }
  return data;
};

/**
 * Cancels a reservation.
 * @param reservationId - The ID of the reservation in the event_reservations table.
 * @param status - The status of the reservation.
 */
export const cancelReservation = async (reservationId: string) => {
  try {
    // Update the reservation record in Supabase
    const { data, error } = await supabaseAdmin
      .from('event_reservations')
      .update({
        reservation_status: 'cancelled',
      })
      .eq('id', reservationId);

    if (error) {
      throw new Error(`Failed to cancel reservation: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Error cancelling reservation: ${error.message}`);
  }
};

/**
 * Refunds a reservation.
 * @param paymentIntentId - The ID of the Stripe payment intent.
 */
export const refundReservationWithPaymentIntent = async (paymentIntentId: string) => {
  try {
    // Update the reservation record in Supabase
    const { data, error } = await supabaseAdmin
      .from('event_reservations')
      .update({
        payment_status: 'refunded',
        reservation_status: 'cancelled',
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (error) {
      throw new Error(`Failed to refund reservation: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Error refunding reservation: ${error.message}`);
  }
};

/**
 * Updates the event_reservations record in Supabase with the receipt URL after a payment is completed.
 * @param paymentIntentId - The ID of the Stripe payment intent.
 * @param receiptUrl - The URL of the payment receipt.
 */
export const addReceiptUrl = async (reservationId: string, receiptUrl: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_reservations')
      .update({
        stripe_receipt_url: receiptUrl,
      })
      .eq('id', reservationId);

    if (error) {
      throw new Error(`Failed to update reservation with receipt URL: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error(`Error updating reservation with receipt URL: ${error.message}`);
    throw new Error(`Error updating reservation with receipt URL: ${error.message}`);
  }
};

export const updatePriceRecord = async (price: Stripe.Price, retryCount = 0, maxRetries = 3) => {
  const { error: upsertError } = await supabaseAdmin
    .from('events')
    .update({
      price_stripe_id: price.id,
      price_currency: price.currency,
      price: price.unit_amount,
    })
    .match({ price_stripe_id: price.id });

  if (upsertError?.message.includes('foreign key constraint')) {
    if (retryCount < maxRetries) {
      console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await updatePriceRecord(price, retryCount + 1, maxRetries);
    } else {
      throw new Error(
        `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
      );
    }
  } else if (upsertError) {
    throw new Error(`Price insert/update failed: ${upsertError.message}`);
  } else {
    console.log(`Price inserted/updated: ${price.id}`);
  }
};

export const deleteProductRecord = async (product: Stripe.Product) => {
  const { error: deletionError } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', product.id);
  if (deletionError) throw new Error(`Product deletion failed: ${deletionError.message}`);
  console.log(`Product deleted: ${product.id}`);
};

export const upsertCustomerToSupabase = async (uuid: string, customerId: string) => {
  const { error: upsertError } = await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customerId })
    .eq('id', uuid);

  if (upsertError)
    throw new Error(`Supabase customer record creation failed: ${upsertError.message}`);

  return customerId;
};

export const createCustomerInStripe = async (uuid: string, email: string) => {
  const customerData = { metadata: { supabaseUUID: uuid }, email: email };
  const newCustomer = await stripe.customers.create(customerData);
  if (!newCustomer) throw new Error('Stripe customer creation failed.');

  return newCustomer.id;
};

export const createOrRetrieveCustomer = async ({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) => {
  // Check if the customer already exists in Supabase
  const { data: existingSupabaseCustomer, error: queryError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', uuid)
    .maybeSingle();

  if (queryError) {
    throw new Error(`Supabase customer lookup failed: ${queryError.message}`);
  }

  // Retrieve the Stripe customer ID using the Supabase customer ID, with email fallback
  let stripeCustomerId: string | undefined;
  if (existingSupabaseCustomer?.stripe_customer_id) {
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingSupabaseCustomer.stripe_customer_id
    );
    stripeCustomerId = existingStripeCustomer.id;
  } else {
    // If Stripe ID is missing from Supabase, try to retrieve Stripe customer ID by email
    const stripeCustomers = await stripe.customers.list({ email: email });
    stripeCustomerId = stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
  }

  // If still no stripeCustomerId, create a new customer in Stripe
  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(uuid, email);
  if (!stripeIdToInsert) throw new Error('Stripe customer creation failed.');

  if (existingSupabaseCustomer && stripeCustomerId) {
    // If Supabase has a record but doesn't match Stripe, update Supabase record
    if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', uuid);

      if (updateError)
        throw new Error(`Supabase customer record update failed: ${updateError.message}`);
      console.warn(`Supabase customer record mismatched Stripe ID. Supabase record updated.`);
    }
    // If Supabase has a record and matches Stripe, return Stripe customer ID
    return stripeCustomerId;
  } else {
    console.warn(`Supabase customer record was missing. A new record was created.`);

    // If Supabase has no record, create a new record and return Stripe customer ID
    const upsertedStripeCustomer = await upsertCustomerToSupabase(uuid, stripeIdToInsert);
    if (!upsertedStripeCustomer) throw new Error('Supabase customer record creation failed.');

    return upsertedStripeCustomer;
  }
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
export const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] },
    })
    .eq('id', uuid);
  if (updateError) throw new Error(`Customer update failed: ${updateError.message}`);
};
