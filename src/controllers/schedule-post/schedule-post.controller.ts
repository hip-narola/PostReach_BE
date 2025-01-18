import { Controller } from '@nestjs/common';
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
