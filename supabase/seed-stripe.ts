const Stripe = require('stripe');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: '.env.development' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or key is not set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? '',
  {
    // https://github.com/stripe/stripe-node#configuration
    // https://stripe.com/docs/api/versioning
    // @ts-ignore
    apiVersion: null,
    // Register this as an official Stripe plugin.
    // https://stripe.com/docs/building-plugins#setappinfo
    appInfo: {
      name: 'inner circle',
      version: '0.0.0',
      url: '',
    },
  }
);

interface Event {
  id: string;
  name: string;
  price: number;
  price_currency: string;
  status: string;
}

async function createStripeProductForEvent(event: Event) {
  try {
    // Check if the event status is 'reserving' to proceed with product creation
    // Create a product in Stripe
    const product = await stripe.products.create({
      name: event.name,
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: event.price ? event.price * 100 : 0,
      currency: event.price_currency,
      active: event.status === 'reserving',
    });

    // Update the event with the Stripe price ID
    const { error } = await supabase
      .from('events')
      .update({ price_stripe_id: price.id })
      .eq('id', event.id);

    if (error) {
      throw new Error(`[Failed] to update event with Stripe price ID: ${error.message}`);
    }

    console.log(`Product and price created with IDs: ${product.id}, ${price.id}`);
    return { productId: product.id, priceId: price.id };
  } catch (error) {
    console.error('[Failed] to create Stripe product:', error);
    throw error;
  }
}

// Fetch all events from the public.events table in Supabase and create Stripe products for each
async function createStripeProductsForAllEvents() {
  const { data: events, error } = await supabase.from('events').select('*');

  if (error) {
    console.error('Error fetching events:', error);
    return;
  }

  if (events) {
    events.forEach(async event => {
      // Check if the event is already in stripe.products
      const { data: existingProduct, error } = await stripe.products.list({
        limit: 1,
        ids: [`prod_${event.id}`],
      });

      const eventIdShort = event.id.split('-')[0];

      if (error) {
        console.error(`Error checking existing Stripe product for event ${event.id}:`, error);
        return;
      }

      if (!existingProduct) {
        createStripeProductForEvent(event)
          .then(result => {
            if (result) {
              console.log(`[Created] ${result.productId}, ${result.priceId}`);
            }
          })
          .catch(error => {
            console.error(`[Error] creating Stripe product for event ${eventIdShort}:`, error);
          });
      } else {
        console.log(`[Skipping] Stripe product creation, already exists for event ${eventIdShort}`);
        // Check if price_stripe_id is populated
        const { data: eventWithPrice, error: fetchError } = await supabase
          .from('events')
          .select('price_stripe_id')
          .eq('id', event.id)
          .single();

        if (fetchError) {
          console.error(
            `Error fetching event ${eventIdShort} to check price_stripe_id:`,
            fetchError
          );
          return;
        }

        if (!eventWithPrice.price_stripe_id) {
          // Fetch the related price ID from stripe.prices
          let relatedProduct;

          try {
            relatedProduct = await stripe.products.retrieve(`prod_${event.id}`);
          } catch (productError) {
            console.error(
              `[Error] fetching related product for event ${eventIdShort} with prod_${event.id}:`,
              productError
            );
            return;
          }

          if (!relatedProduct) {
            console.error(
              `[Error] No related product found for event ${event.id} with prod_${event.id}`
            );
            return;
          }

          let relatedPrice;
          try {
            relatedPrice = await stripe.prices.list({
              product: `prod_${event.id}`,
              limit: 1,
            });
          } catch (priceError) {
            console.error(`[Error] fetching related price for event ${eventIdShort}:`, priceError);
            return;
          }

          if (!relatedPrice.data.length) {
            console.error(`[Error] No related price found for event ${eventIdShort}`);
            return;
          }

          const priceId = relatedPrice?.data?.[0].id;

          if (priceId) {
            // Update the event with the Stripe price ID
            const { error: updateError, count: updateCount } = await supabase
              .from('events')
              .update({ price_stripe_id: priceId })
              .match({ id: event.id })
              .select();

            if (updateError) {
              console.error(
                `[Failed] to update event ${eventIdShort} with Stripe price ID:`,
                updateError
              );
            } else if (updateCount === 0) {
              console.log(`[Error] No records found to update for event ${eventIdShort}`);
            } else {
              console.log(`[Updated] event ${eventIdShort} with Stripe price ID ${priceId}`);
            }
          }
        }
      }
    });
  }
}

createStripeProductsForAllEvents();
