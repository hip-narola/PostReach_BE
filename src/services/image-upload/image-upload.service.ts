import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { log } from 'console';

@Injectable()
export class ImageUploadService {
	constructor(
		@Inject(SupabaseClient) private readonly supabase: SupabaseClient,
	) { }
	async uploadImage(
		bucketName: string,
		file: Express.Multer.File,
		folderName: string,
	): Promise<{ publicUrl: string; filePath: string }> {
		try {
			const filePath = `${folderName}/${file.originalname}`;

			// Ensure the bucket exists (or create if needed)
			await this.createBucketIfNotExists(bucketName);

			// Upload the file
			const { data: uploadData, error: uploadError } = await this.supabase.storage
				.from(bucketName)
				.upload(filePath, file.buffer, {
					upsert: true,
					contentType: file.mimetype,
				});
			if (uploadError) {
				throw new HttpException('uploadError uploading file: ' + uploadError.message, HttpStatus.INTERNAL_SERVER_ERROR);
			}
			// Get the public URL of the uploaded file
			const { data: urlData } = this.supabase.storage
				.from(bucketName)
				.getPublicUrl(filePath);

			if (!urlData || !urlData.publicUrl) {
				throw new HttpException('Error getting file URL', HttpStatus.INTERNAL_SERVER_ERROR);
			}

			return {
				publicUrl: urlData.publicUrl,
				filePath: uploadData.path, // Return the path of the uploaded file
			};
			//   return urlData.publicUrl;
		} catch (error) {
			throw new HttpException('Failed to upload image', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async createBucketIfNotExists(bucketName: string) {
		try {
			// Fetch all existing buckets using the service role key or elevated permissions
			const { data: buckets, error } = await this.supabase.storage.listBuckets(); // using supabaseAdmin client

			if (error) {
				throw new HttpException('Error listing buckets: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
			}

			// Check if the bucket with the given name already exists
			const bucketExists = buckets.some((bucket) => bucket.name === bucketName);

			if (bucketExists) {
				return;
			}

			// Create a new bucket if it does not exist
			const { data, error: createError } = await this.supabase.storage.createBucket(bucketName, {
				public: true, // default: false
			})

			if (createError) {
				throw new HttpException('Error creating bucket: ' + createError.message, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (err) {
			throw new HttpException('Failed to check or create bucket', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	async deleteImage(bucketName: string, filePath: string): Promise<void> {

		try {
			const { error } = await this.supabase.storage
				.from(bucketName)
				.remove([filePath]);

			if (error) {
				throw new HttpException('Error deleting file: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (error) {
			throw new HttpException('Failed to delete image', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}