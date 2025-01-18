import { Controller, Get, Param } from '@nestjs/common';
import { CheckUserSubscriptionService } from 'src/services/check-user-subscription/check-user-subscription.service';
import { UserService } from 'src/services/user/user.service';

@Controller('check-user-subscription')
export class CheckUserSubscriptionController {
    constructor(
        private readonly userService: UserService,
        private readonly checkUserSubscriptionService: CheckUserSubscriptionService,
    ) { }
    @Get('check-user-subscription/:userId')
    async isUserSubscriptionActive(@Param('userId') userId: number): Promise<boolean> {
        try {
            // const user =  await this.userService.findOne(userId);

            return await this.checkUserSubscriptionService.isUserSubscriptionActive(userId);
        } catch (error) {
            throw error;
        }
    }
}
