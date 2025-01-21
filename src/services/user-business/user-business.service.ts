import {
    Injectable,
    UseGuards,
} from '@nestjs/common';
import { UserBusiness } from 'src/entities/user-business.entity';
import { GenericRepository } from 'src/repositories/generic-repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserBusinessDto } from 'src/dtos/params/user-business.dto/user-business.dto';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt/jwt.guard';
import { ImageUploadService } from '../image-upload/image-upload.service';

@Injectable()
export class UserBusinessService {
    private readonly userBusinessRepository: GenericRepository<UserBusiness>;
    private supabase;
    constructor(
        @InjectRepository(UserBusiness)
        private userBusinessRepo: Repository<UserBusiness>,
        private readonly unitOfWork: UnitOfWork,
        private readonly imageUploadService: ImageUploadService,
    ) {
        this.userBusinessRepository = new GenericRepository<UserBusiness>(
            userBusinessRepo,
        );
    }

    @UseGuards(JwtAuthGuard)
    async getBusinessDetail(userId: number): Promise<UserBusiness | any> {
        const userBusiness = await this.userBusinessRepo
            .createQueryBuilder('user_business')
            .where('user_business.user_id = :userId', { userId: userId })
            .getOne();
        if (!userBusiness) {
            throw new Error('No business data found for the given user ID.');
        }
        return userBusiness;
    }

    async createUserBusiness(
        data: UserBusinessDto,
        file?: Express.Multer.File,
    ): Promise<UserBusiness | any> {
        const userBusinessData = plainToInstance(UserBusiness, data);

        // Check if a UserBusiness record with the provided user_id exists
        let userBusiness = await this.userBusinessRepo
            .createQueryBuilder('user_business')
            .where('user_business.user_id = :userId', { userId: data.user_id })
            .andWhere('user_business.deleted_at IS NULL') // Ensures soft-deleted records are excluded
            .getOne();

        if (file) {
            const bucketName = 'user';

            if (userBusiness && userBusiness.image_url) {
                const oldFilePath = userBusiness.image_url; // Use the current file path for deletion
                await this.imageUploadService.deleteImage(
                    bucketName,
                    oldFilePath,
                );
            }

            const folderName = `${data.user_id}/business`;
            const { publicUrl: imageUrl, filePath } =
                await this.imageUploadService.uploadImage(
                    bucketName,
                    file,
                    folderName,
                );
            userBusinessData.image = imageUrl;
            userBusinessData.image_url = filePath;
        }

        if (userBusiness) {
            // Update the existing user business record with new data
            userBusiness = this.userBusinessRepo.merge(
                userBusiness,
                userBusinessData,
            );
            return await this.userBusinessRepo.save(userBusiness);
        } else {
            // Create a new user business record
            return await this.userBusinessRepo.save(userBusinessData);
        }
    }
}
