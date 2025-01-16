import { Strategy, VerifyCallback } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class FacebookPageStrategy extends PassportStrategy(Strategy, 'facebook-page') {
  constructor(private readonly appId: string, private readonly appSecret: string, private readonly facebookStrategy: string
  ) {
    super({
      clientID: appId,
      clientSecret: appSecret,
      callbackURL: facebookStrategy,
      profileFields: ['id', 'emails', 'name', 'gender', 'birthday', 'accounts', 'picture'],
      scope: ['email', 'public_profile', 'pages_show_list', 'pages_read_engagement', 'read_insights', 'pages_manage_posts', 'pages_read_user_content'],
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
      accounts: profile._json?.accounts || null,
      profilePicture: profile.photos?.[0]?.value || null,
    };

    done(null, user);
  }
}
