import { Body, Controller, HttpException, Post, Req, Res } from "@nestjs/common";
import { PayProccessService } from "./payProccess.service";

@Controller('payment')
export class PayProccessController {
    constructor(private readonly payProccessService: PayProccessService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body('lookup_key') lookupKey: string, @Res() res: Response) {
    const url = await this.payProccessService.createCheckoutSession(lookupKey);
    return {redirectTo: url}
  }

  @Post('create-portal-session')
  async createPortalSession(@Body('session_id') sessionId: string, @Res() res: Response) {
    const url = await this.payProccessService.createPortalSession(sessionId);
    return {redirectTo: url}
  }

  @Post('webhook')
  handleWebhook(@Req() req: any, @Res() res: Response) {
    const endpointSecret = 'whsec_12345'; // Replace with your actual webhook secret

    let event : any = req.body;

    if (endpointSecret) {
      const signature = req.headers['stripe-signature'];
      try {
        event  = this.payProccessService.handleWebhook({
          rawBody: req.rawBody,
          signature,
          endpointSecret,
        });
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return new HttpException('Webhook signature verification failed', 500)
      }
    }

    this.payProccessService.handleWebhook(event);
    return {redirectTo: false}
  }
}