import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class PayProccessService { 
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe('pk_test_51PpjqAGK76OmChxNrGKixO4GPAEGnvpf43cl9wjhlB5u6NBxyeduwUcPPbp5sB25bHvI3ZgnYzbmL3hzcLoRynPj00vEssOTxu', {
          apiVersion: '2024-06-20',
        });
      }

      async createCheckoutSession(lookupKey: string) {
        const prices = await this.stripe.prices.list({
          lookup_keys: [lookupKey],
          expand: ['data.product'],
        });

        const session = await this.stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [
              {
                price: prices.data[0].id,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: `http://localhost:4200/gymPage/login/sporthouses`,
            cancel_url: `https://www.youtube.com/watch?v=efvl02bTTYM`,
          });
      
          return session.url;
        }
    
        async createPortalSession(sessionId: string) {
            const checkoutSession = await this.stripe.checkout.sessions.retrieve(sessionId);
            const portalSession = await this.stripe.billingPortal.sessions.create({
                customer: checkoutSession.customer.toString(),
                return_url: `https://www.youtube.com/watch?v=RpzwuW4hFSQ&list=PLV-DQnYj14bQhzyEcovzDd83EzVZLwgK9`,
            });
        
            return portalSession.url;
          }
        
          handleWebhook(event: any) {
            let subscription;
            let status;
        
            switch (event.type) {
              case 'customer.subscription.trial_will_end':
                subscription = event.data.object;
                status = subscription.status;
                console.log(`Subscription status is ${status}.`);
                break;
              case 'customer.subscription.deleted':
                subscription = event.data.object;
                status = subscription.status;
                console.log(`Subscription status is ${status}.`);
                break;
              case 'customer.subscription.created':
                subscription = event.data.object;
                status = subscription.status;
                console.log(`Subscription status is ${status}.`);
                break;
              case 'customer.subscription.updated':
                subscription = event.data.object;
                status = subscription.status;
                console.log(`Subscription status is ${status}.`);
                break;
              case 'entitlements.active_entitlement_summary.updated':
                subscription = event.data.object;
                console.log(`Active entitlement summary updated for ${subscription}.`);
                break;
              default:
                console.log(`Unhandled event type ${event.type}.`);
            }
          }
}