import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { OnboardingService } from 'src/services/onboarding/onboarding.service';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt/jwt.guard';

@Controller('onboarding')
@SkipThrottle()
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) { }

    @UseGuards(JwtAuthGuard)
    @Get('fetch-questions')
    async getData() {
        try {
            const data = await this.onboardingService.getData();
            return data;
        } catch (error) {
            throw new Error(`Data not found.${error}`);
        }
    }
}
