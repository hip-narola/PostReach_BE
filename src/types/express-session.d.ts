import { Session } from 'express-session';

declare module 'express-session' {
  interface Session {
    userId: string; 
    platformName?: string;  // Add platformName here

  }
}