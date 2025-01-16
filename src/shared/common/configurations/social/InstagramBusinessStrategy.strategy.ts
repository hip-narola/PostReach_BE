import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-facebook';
@Injectable()
export class InstagramBusinessStrategy extends PassportStrategy(Strategy, 'instagram-link') {
    constructor(private readonly appId: string, private readonly appSecret: string, private readonly strategy:string) {
        super({
            clientID: appId,
            clientSecret: appSecret,
            callbackURL: strategy,
            profileFields: ['id', 'emails', 'name', 'accounts'],
            scope: ['instagram_basic', 'pages_show_list', 'pages_read_engagement', 'pages_manage_metadata', 'instagram_manage_insights', 'instagram_manage_comments', 'instagram_content_publish'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {

        const { name, emails } = profile;
        const email = emails && emails.length > 0 ? emails[0].value : null;
        const user = {
            email,
            firstName: name.givenName,
            lastName: name.familyName,
            FacebookID: profile.id,
            accessToken,
            accounts: profile._json?.accounts || null,
        };

        done(null, user);
    }
}
