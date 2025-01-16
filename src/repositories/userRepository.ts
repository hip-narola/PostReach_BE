import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';

@Injectable()
export class UserRepository extends GenericRepository<User> {
  constructor(repository: Repository<User>) {
    super(repository);
  }
  async findsocialProfiles(userId: number): Promise<SocialMediaAccount[]> {
    // Query only the SocialMediaAccount entities associated with the given userId
    return this.repository.manager
      .createQueryBuilder(SocialMediaAccount, 'socialMediaAccount')
      .select([
        'socialMediaAccount.platform',
        'socialMediaAccount.encrypted_access_token',
      ])
      .where('socialMediaAccount.user_id = :userId', { userId })
      .getMany();
  }

  async findBySocialMediaId(socialMediaId: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { socialMediaId: socialMediaId },
    });
  }
}
