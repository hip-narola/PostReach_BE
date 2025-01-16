import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly secretService: AwsSecretsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {

        const data = await secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
        const region = data.REGION;
        const userPoolId = data.USERPOOLID;
        const kid = jwt.decode(rawJwtToken, { complete: true }).header.kid;
        const client = jwksRsa({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
        });
        client.getSigningKey(kid, (err, key) => {
          const signingKey = key.getPublicKey();
          done(err, signingKey);
        });
      },
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
