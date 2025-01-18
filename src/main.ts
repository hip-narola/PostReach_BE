import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';
import { Logger } from './services/logger/logger.service';
import { GlobalExceptionFilter } from './shared/filters/global-exception/global-exception.filter';
import helmet from 'helmet';
// import * as rateLimit from 'express-rate-limit';
// import * as RedisStore from 'connect-redis';
// import { createClient } from 'redis';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const logger = app.get(Logger);
	const configService = app.get(ConfigService);

	// Environment-based configurations
	const isProduction = configService.get('NODE_ENV') === 'production';

	// Helmet for securing HTTP headers
	app.use(helmet());

	// Configure sessions
	app.use(
		session({
			secret: configService.get('SESSION_SECRET') || 'your-default-secret',
			resave: false,
			saveUninitialized: false,
			cookie: {
				domain: '.railway.app',
				secure: true,//isProduction, // HTTPS in production
				httpOnly: true, // Prevent client-side JavaScript access
				sameSite: 'none', // isProduction ? 'none' : 'lax', // 'None' for cross-origin
				maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
				// partitioned: true
			},
		}),
	);

	// Middleware for handling raw body for Stripe webhook
	app.use('/payment/webhook', bodyParser.raw({ type: 'application/json' }));

	// Other middlewares
	app.use(cookieParser());
	// CORS configuration
	const allowedOrigins = [
		'https://postreachfe-production.up.railway.app',
		'https://postreachbe-production.up.railway.app',
		'http://localhost:3001'
	];

	app.enableCors({
		origin: [
			'https://postreachfe-production.up.railway.app',
			'https://postreachbe-production.up.railway.app',
			'https://*.post-reach-fe.vercel.app',
			'http://localhost:3001'
		],
		credentials: true,
		methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
		exposedHeaders: ['set-cookie'],
	});

	// Rate limiting for basic DOS protection
	// app.use(
	//   rateLimit({
	//     windowMs: 15 * 60 * 1000, // 15 minutes
	//     max: 100, // Limit each IP to 100 requests per windowMs
	//     message: 'Too many requests from this IP, please try again later.',
	//   }),
	// );

	// Swagger setup
	const swaggerConfig = new DocumentBuilder()
		.setTitle('Post Reach AI')
		.setDescription('The Post Reach AI API description')
		.setVersion('1.0')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api', app, document, {
		swaggerOptions: {
			authAction: {
				Bearer: {
					name: 'Authorization',
					schema: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
					value: 'Bearer <JWT>',
				},
			},
		},
	});

	// Exception handling
	const httpAdapter = app.get(HttpAdapterHost);
	app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
	app.useGlobalFilters(new GlobalExceptionFilter(logger));


	// Health check endpoint
	app.getHttpAdapter().get('/health', (req, res) => {
		res.status(200).send('OK');
	});

	// Start listening
	const port = configService.get('PORT') || 3000;
	await app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}`);
	});
}

bootstrap();
