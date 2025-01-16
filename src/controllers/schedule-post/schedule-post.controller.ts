import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SchedulePostDto } from 'src/dtos/params/schedule-post-param.dto';
import { PostService } from 'src/services/schedule-post/schedule-post.service';


@Controller('posts')
export class SchedulePostController {
    constructor(private readonly schedulePostService: PostService) { }

    // @Post('schedule')
    // @ApiBody({ type: SchedulePostDto })
    // async schedulePost(
    //   @Body() schedulePostDto: SchedulePostDto
    // ) {
    //   const { postid, title, postContent, scheduleDate } = schedulePostDto;
    //     return this.schedulePostService.schedulePost(postid,title, postContent, scheduleDate);
    // }

}
