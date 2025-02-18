import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt/jwt.guard';

@SkipThrottle()
@Controller('payment')
export class PaymentController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
    ) { }

    // test call
    @UseGuards(JwtAuthGuard)
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

	@UseGuards(JwtAuthGuard)
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

	@UseGuards(JwtAuthGuard)
    @Post('get-coustomer-payment-link')
    async getCoustomerPaymentLink(@Body() body: { userId: number }, @Res() res: Response) {
        const portal = await this.subscriptionService.generateCustomerPortalLink(
            body.userId,
        );
        if (portal != null)
            return res.status(HttpStatus.OK).json({
                StatusCode: HttpStatus.OK,
                Message: 'Please check Stripe redirection to manage your subscription.',
                IsSuccess: true,
                Data: { url: portal.url },
            });
        else
            return res.status(HttpStatus.OK).json({
                StatusCode: HttpStatus.OK,
                Message: 'Subscription is not started yet. Please connect to any social media to start your trail period.',
                IsSuccess: false,
                Data: { url: null },
            });
    }
}