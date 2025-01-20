import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { UserService } from 'src/services/user/user.service';
import { User } from 'src/entities/user.entity';
import { CognitoIdentityService } from 'src/services/cognito-identity/cognito-identity.service';

import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userService: UserService,
    private readonly cognitoIdentityService: CognitoIdentityService,
    private readonly secretService: AwsSecretsService,
    private readonly clientId: string,
    private readonly clientsecret: string,
    private readonly googleStrategy: string

  ) {
    super({
      clientID: clientId,
      clientSecret: clientsecret,
      callbackURL: googleStrategy,
      scope: ['email', 'profile'],
      state: true,
      prompt: 'login',
      accessType: 'offline',
      include_granted_scopes: false,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    const googleId = profile.id;
    const { name, emails, photos } = profile;
    try {
      let cognitoAccessToken: string;
      let userId: number;
      const userDetails = new User();
      userDetails.name = name.givenName;
      userDetails.socialMediaId = googleId;
      userDetails.email = emails[0].value;

      // Get user by google id
      const existingUser = await this.userService.findBySocialMediaId(googleId);

      if (existingUser != null) {
        // Get access token from AWS by cognito id
        userId = existingUser.id;
        cognitoAccessToken = await this.cognitoIdentityService.getIdToken(existingUser.cognitoId);
      } else {
        // Create user in AWS
        const cognitoUser = await this.cognitoIdentityService.createUser(userDetails);
        userDetails.cognitoId = cognitoUser.Username;

        // Create user in PostReach DB
        const newUser = await this.userService.createUser(userDetails);
        userId = newUser.id;

        // Get access token from AWS by cognito id
        cognitoAccessToken = await this.cognitoIdentityService.getIdToken(cognitoUser.Username);
      }

      const user = {
        userId: userId,
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos[0].value,
        accessToken,
        refreshToken,
        cognitoIdToken: cognitoAccessToken
      };

      done(null, user);
    } catch (error) {
      throw error;
      done(null, { redirect: "" });
    }

  }
}