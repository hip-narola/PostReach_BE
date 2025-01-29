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
import rateLimit from 'express-rate-limit';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(Logger);
  const configService = app.get(ConfigService);

  // Helmet for securing HTTP headers
  app.use(helmet());

  //Configure sessions with more secure options
  app.use(
    session({
      secret: configService.get('SESSION_SECRET') || '0716f5f0-4c0d-41d5-9564-a93f38b5a931',
      resave: false,
      saveUninitialized: false,
      cookie: {
        domain: configService.get('COOKIE_DOMAIN'),
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
      }
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  // Middleware for handling raw body for Stripe webhook
  app.use('/payment/webhook', bodyParser.raw({ type: 'application/json' }));

  // Other middlewares
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: ['https://postreachfe-production.up.railway.app', 'https://postreachbe-production.up.railway.app', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  });

  // Rate limiting for basic DOS protection
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200, // Limit each IP to 200 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

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