import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { GetSocilInsightsParamDto } from 'src/dtos/params/get-social-insights-param.dto';
import { SocialMediaInsightsService } from 'src/services/social-media-insights/social-media-insights.service';

@Controller('dashboard-insights')
export class DashboardInsightsController {

    constructor(private readonly socialMediaInsightsService: SocialMediaInsightsService) { }

    // get insights  for all social media accounts
    @Post('getSocialinsightsList')
    @ApiBody({ type: GetSocilInsightsParamDto })
    async getSocialinsightsList(@Body() GetSocilInsightsParamDto: { days: number, userId: number, platform: number | null }): Promise<any> {
        return await this.socialMediaInsightsService.getSocialinsightsList(GetSocilInsightsParamDto);
    }
}