import session from 'express-session';

declare module 'express-session' {
    interface SessionData {
        codeVerifier?: { codeVerifier: string; state: string };
        facebookPageDetails?: string;
        instagramPageDetails?: string;
    }
}
