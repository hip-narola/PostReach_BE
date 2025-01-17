import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import * as bodyParser from 'body-parser'; // Correctly imported
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	// Configure sessions
	app.use(
		session({
			secret: 'your-secret-key',
			resave: false,
			saveUninitialized: false,
			cookie: { secure: false },
		}),
	);

	// Middleware for handling raw body for Stripe webhook
	app.use('/payment/webhook', bodyParser.raw({ type: 'application/json' }));

	// Other middlewares
	app.use(cookieParser());
	// Replace the corsOptions with this:
	const corsOptions = {
		origin: [
			'http://localhost:3001',
			'https://postreach-ai-client-edricgsh-edricgshs-projects.vercel.app',
			'https://post-reach-fe.vercel.app'
		],
		credentials: true,
		methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
		exposedHeaders: ['set-cookie'],
	};
	app.enableCors(corsOptions);

	// Swagger configuration
	const config = new DocumentBuilder()
		.setTitle('Post Reach AI')
		.setDescription('The Post Reach AI API description')
		.setVersion('1.0')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	// Exception handling
	const httpAdapter = app.get(HttpAdapterHost);
	app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

	// Start listening
	const port = configService.get<string>('PORT') || 3000;
	await app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}`);
	});
}

bootstrap();
