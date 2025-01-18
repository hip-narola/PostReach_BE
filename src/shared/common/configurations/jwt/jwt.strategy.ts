import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    dotenv.config();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        try {
          const decoded = jwt.decode(rawJwtToken, { complete: true });
          if (!decoded || !decoded.header || !decoded.header.kid) {
            return done(
              new UnauthorizedException('Invalid token format'),
              null,
            );
          }

          const jwksUri = `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_DJ54mgTQv/.well-known/jwks.json`;

          const kid = decoded.header.kid;
          const client = jwksRsa({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 100,
            jwksUri: jwksUri,
            timeout: 30000,
          });

          client.getSigningKey(kid, (err, key) => {
            if (err || !key) {
              return done(
                new UnauthorizedException('Unable to get signing key'),
                null,
              );
            }
            try {
              const signingKey = key.getPublicKey();
              done(null, signingKey);
            } catch (error) {
              done(new UnauthorizedException('Invalid signing key'), null);
            }
          });
        } catch (error) {
          done(new UnauthorizedException('Failed to process token'), null);
        }
      },
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub || !payload.username) {
      throw new UnauthorizedException('Invalid payload');
    }
    return { userId: payload.sub, username: payload.username };
  }
}