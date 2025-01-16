import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { PaginationParamDto } from 'src/dtos/params/pagination-param.dto';
import { PaginatedResponseDto } from 'src/dtos/response/pagination-response.dto';
import { CalenderService } from 'src/services/calender/calender.service';
import { Response, Request } from 'express';
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
