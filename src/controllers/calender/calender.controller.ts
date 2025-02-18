import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { CalenderService } from 'src/services/calender/calender.service';
import { CalenderParamDto } from 'src/dtos/params/calender-param.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt/jwt.guard';

@Controller('calendar')
@SkipThrottle()
export class CalenderController {

    constructor(private readonly calenderService: CalenderService) { }
    
	@UseGuards(JwtAuthGuard)
    @Post('getList')
    @ApiBody({ type: CalenderParamDto })
    async getCalenderList(@Body() CalenderParamDto: { startWeekDate: Date; endWeekDate: Date, userId: number }): Promise<any> {
        return await this.calenderService.getCalenderList(CalenderParamDto);
    }
}
