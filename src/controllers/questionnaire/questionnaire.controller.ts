import {
    Body,
    Controller,
    Get,
    Param,
    Post,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { QuestionnaireService } from 'src/services/questionnaire/questionnaire.service';

@SkipThrottle()
@Controller('questionnaire')
export class QuestionnaireController {
    constructor(private readonly questionnaireService: QuestionnaireService) { }

    @Get('user/:userId')
    async get(@Param('userId') userId: number) {
        try {
            const data =
                await this.questionnaireService.questionnaireUserDetail(userId);
            return data;
        } catch (error) {
            throw error;
        }
    }

    @Get('get/:questionnaireId/:userId')
    async businessPreference(
        @Param('questionnaireId') questionnaireId: number,
        @Param('userId') userId: number,
    ) {
        try {
            const data = await this.questionnaireService.businessPreference(
                questionnaireId,
                userId,
            );
            return data;
        } catch (error) {
            throw error;
        }
    }

    @Get(':id/:userId')
    async getUserData(
        @Param('id') id: number,
        @Param('userId') userId: number,
    ) {
        try {
            const data = await this.questionnaireService.getUserData(
                id,
                userId,
            );
            return data;
        } catch (error) {
            throw error;
        }
    }

    @Post('save/:id/:userId')
    async saveData(
        @Param('id') id: number,
        @Param('userId') userId: number,
        @Body() answers: any[],
    ) {
        try {
            const data = await this.questionnaireService.storeData(
                id,
                userId,
                answers,
            );
            return data;
        } catch (error) {
            throw error;
        }
    }
}
