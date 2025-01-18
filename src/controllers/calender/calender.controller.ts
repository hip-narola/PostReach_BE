import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { CalenderService } from 'src/services/calender/calender.service';
import { CalenderParamDto } from 'src/dtos/params/calender-param.dto';
@Controller('calendar')
export class CalenderController {

    constructor(private readonly calenderService: CalenderService) {}

    @Post('getList')
	@ApiBody({ type: CalenderParamDto })
    async getCalenderList(@Body() CalenderParamDto: { startWeekDate: Date; endWeekDate: Date,userId:number  }):Promise<any> {
        return await this.calenderService.getCalenderList(CalenderParamDto);
    }
    
}
