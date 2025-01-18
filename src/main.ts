import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
// import * as rateLimit from 'express-rate-limit';
// import * as RedisStore from 'connect-redis';
import { createClient } from 'redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Environment-based configurations
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Helmet for securing HTTP headers
  app.use(helmet());

  // Redis-based session store for scalability
  const redisClient = createClient({
    url: configService.get('REDIS_URL'),
    legacyMode: true,
  });
  await redisClient.connect();

  app.use(
    session({
      // store: new RedisStore({
      //   client: redisClient,
      //   ttl: 86400, // 1 day in seconds
      // }),
      secret: configService.get('SESSION_SECRET') || 'your-default-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        domain: configService.get('COOKIE_DOMAIN'),
        secure: isProduction, // HTTPS in production
        httpOnly: true, // Prevent client-side JavaScript access
        sameSite: isProduction ? 'none' : 'lax', // 'None' for cross-origin
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      },
    }),
  );

  // Middleware for handling raw body for Stripe webhook
  app.use('/payment/webhook', bodyParser.raw({ type: 'application/json' }));

  // Cookie parser middleware
  app.use(cookieParser());

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:3001',
    configService.get('APP_URL_FRONTEND') 
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
