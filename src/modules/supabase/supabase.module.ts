import { Module, Global } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';

@Global()
@Module({
	imports: [AwsSecretsServiceModule],
	providers: [
		{
			provide: SupabaseClient,
			useFactory: async (secretService: AwsSecretsService) => {
				const data = await secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
				const SUPABASE_URL = data.SUPABASE_URL;
				const SUPABASE_KEY = data.SERVICE_ROLESECRET;

				return createClient(SUPABASE_URL, SUPABASE_KEY);
			},
			inject: [AwsSecretsService],
		},
	],
	exports: [SupabaseClient],
})
export class SupabaseModule { }
