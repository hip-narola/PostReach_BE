import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { OnboardingService } from 'src/services/onboarding/onboarding.service';

@Controller('onboarding')
@SkipThrottle()
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) {}

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
