import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDto } from 'src/dtos/params/user.dto';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/services/user/user.service';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt/jwt.guard';

@Controller('user')
export class UserController {
    private supabase;

    constructor(private readonly userService: UserService) {
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id')
    @UseInterceptors(FileInterceptor('profilePicture'))
    async updateUser(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: number,
        @Body() userData: UserDto,
    ) {
        try {
            const data = await this.userService.updateUser(id, userData, file);
            return {
                message: 'Profile details updated successfully',
                data: data,
            };
        } catch (error) {
            throw new HttpException(
                error,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<User> {
        return await this.userService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile-status/:id')
    async findUserProfileStatus(@Param('id') id: number): Promise<any> {
        return this.userService.profileStatus(id);
    }
}
