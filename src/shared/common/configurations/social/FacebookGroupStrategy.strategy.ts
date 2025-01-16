import { Strategy, VerifyCallback } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
@Injectable()
export class FacebookGroupStrategy extends PassportStrategy(Strategy, 'facebook-group-link') {
  constructor(private readonly appId: string, private readonly appSecret: string, private readonly facebookStartegy: string) {
    super({
      clientID: appId,
      clientSecret: appSecret,
      callbackURL: facebookStartegy,
      profileFields: ['id', 'emails', 'name', 'gender', 'birthday'],
      scope: ['email', 'public_profile', 'publish_to_groups'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;
    const email = emails && emails.length > 0 ? emails[0].value : null;

    const user = {
      email,
      firstName: name.givenName,
      lastName: name.familyName,
      facebookId: profile.id,
      accessToken,
    };

    done(null, user);
  }
}
