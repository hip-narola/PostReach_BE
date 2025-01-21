import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SocialMediaAccountService } from 'src/services/social-media-account/social-media-account.service';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt/jwt.guard';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';

@Controller('social-media-account')
export class SocialMediaAccountController {
    constructor(private readonly socialMediaAccountService: SocialMediaAccountService) { }

    @UseGuards(JwtAuthGuard)
    @Get('user/:id')
    async findUserProfileStatus(@Param('id') id: number): Promise<any[]> {
        try {
            let data = await this.socialMediaAccountService.socialLinks(id);

            data = data.map((account) => {
                // Get the platform number based on the name
                const platformNumber = Object.keys(SocialMediaPlatformNames).find(
                    (key) => SocialMediaPlatformNames[key] === account.platform
                );

                return {
                    platform: Number(platformNumber), // Convert to a number
                    encrypted_access_token: account.encrypted_access_token,
                    ...(account.platform === SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN] && { isPage: !!account.page_id }), // Add `isPage` if LinkedIn
                };
            });
            return data;
        } catch (error) {
            throw new Error('Unable to fetch user profile status.');
        }
    }

}
