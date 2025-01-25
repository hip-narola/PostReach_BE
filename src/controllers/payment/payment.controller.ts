import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Post,
    Req,
    Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SubscriptionService } from 'src/services/subscription/subscription.service';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
    ) { }

    // test call
    @Get('save-user-trial-subscription/:userId')
    async saveUserTrialSubscription(
        @Param('userId') userId: number,
    ) {
        return await this.subscriptionService.saveUserTrialSubscription(
            userId
        );
    }

    // test call for future ref.
    // @Get('cancel-user-subscription/:userId')
    // async cancelUserSubscription(
    //     @Param('userId') userId: number) {
    //     return await this.subscriptionService.cancelUserSubscription(
    //         userId,
    //     );
    // }


    @Post('webhook')
    async handleWebhook(
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        try {
            await this.subscriptionService.processWebhook(req);
            res.status(HttpStatus.OK).send(); // Correctly calling send method
        } catch (err) {
            res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
        }
    }

    @Post('get-coustomer-payment-link')
    async getCoustomerPaymentLink(@Body() body: { userId: number }) {
        const portal = await this.subscriptionService.generateCustomerPortalLink(
            body.userId,
        );
        if (portal != null)
            return { url: portal.url };
        else
            return { url: null };
    }
}