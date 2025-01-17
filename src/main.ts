import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Environment-based configurations
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // Configure sessions
  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET') || 'your-default-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction, // Set to true in production for HTTPS
        httpOnly: true, // Prevent client-side JavaScript access
        sameSite: isProduction ? 'none' : 'lax', // Use 'None' for cross-origin, 'Lax' otherwise
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      },
    }),
  );

  // Middleware for handling raw body for Stripe webhook
  app.use('/payment/webhook', bodyParser.raw({ type: 'application/json' }));

  // Cookie parser middleware
  app.use(cookieParser());

  // Configure CORS
  const allowedOrigins = [
    'http://localhost:3001',
    'https://postreach-ai-client-edricgsh-edricgshs-projects.vercel.app',
    'https://post-reach-fe.vercel.app',
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  });

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Post Reach AI')
    .setDescription('The Post Reach AI API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Exception handling
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // Start listening
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

bootstrap();
