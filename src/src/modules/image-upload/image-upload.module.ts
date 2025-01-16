import { Module } from '@nestjs/common';
import { ImageUploadService } from 'src/services/image-upload/image-upload.service'; // Adjust the path as needed
import { SupabaseModule } from 'src/modules/supabase/supabase.module';
@Module({
    imports: [SupabaseModule],
    providers: [ImageUploadService],
    exports: [ImageUploadService],
})
export class ImageUploadModule { }
