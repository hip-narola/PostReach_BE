import { Module } from '@nestjs/common';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { LinkedinService } from 'src/services/linkedin/linkedin.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        SocialMediaAccountModule,
        NotificationModule
    ],
    providers: [LinkedinService],
})
export class LinkedinModule { }
