import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	UseInterceptors,
	UploadedFile,
	UseGuards,
} from '@nestjs/common';
import { UserBusinessDto } from 'src/dtos/params/user-business.dto/user-business.dto';
import { UserBusiness } from 'src/entities/user-business.entity';
import { UserBusinessService } from 'src/services/user-business/user-business.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt/jwt.guard';

@SkipThrottle()
@Controller('user-business')
export class UserBusinessController {
	constructor(private readonly userBusinessService: UserBusinessService) { }

	@UseGuards(JwtAuthGuard)
	@Post()
	@UseInterceptors(FileInterceptor('image')) // This 'image' name should match the key in the form-data
	async create(
		@Body() createUserBusinessDto: UserBusinessDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<UserBusiness> {
		return this.userBusinessService.createUserBusiness(
			createUserBusinessDto,
			file,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':userId')
	async findOne(@Param('userId') id: number): Promise<UserBusiness> {
		return await this.userBusinessService.getBusinessDetail(+id);
	}	
}
