import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-facebook';
import { UserService } from 'src/services/user/user.service';
import { CognitoIdentityService } from 'src/services/cognito-identity/cognito-identity.service';
import { User } from 'src/entities/user.entity';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { UserRepository } from 'src/repositories/userRepository';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(

    private readonly userService: UserService,
    private readonly cognitoIdentityService: CognitoIdentityService,
    private readonly unitOfWork: UnitOfWork,
    private readonly appId: string, private readonly appSecret: string, private readonly facebookStartegy: string
  ) {
    super({
      clientID: appId,
      clientSecret: appSecret,
      callbackURL: facebookStartegy,
      profileFields: ['id', 'emails', 'name'],
      scope: ['email'],
      auth_type: 'login',
      authParams: { 'force_reauthentication': 'true' },
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {

    const facebookId = profile.id;
    const { name, emails } = profile;

    const email = emails && emails.length > 0 ? emails[0].value : null;

    try {
      let cognitoAccessToken: string;
      let userId: number;

      const userDetails = new User();
      userDetails.name = name.givenName;
      userDetails.socialMediaId = facebookId;
      userDetails.email = email;

      await this.unitOfWork.startTransaction();
      const userRepository = this.unitOfWork.getRepository(
        UserRepository,
        User,
        true,
      );
      // Get user by facebook id
      const existingUser = await userRepository.findBySocialMediaId(userDetails.socialMediaId/*, userDetails.email*/);

      if (existingUser != null) {
        // Get access token from AWS by cognito id
        userId = existingUser.id;
        cognitoAccessToken = await this.cognitoIdentityService.getIdToken(existingUser.cognitoId);
      } else {
        // Create user in AWS
        const cognitoUser = await this.cognitoIdentityService.createUser(userDetails);
        userDetails.cognitoId = cognitoUser.Username;

        // Create user in PostReach DB
        const newUser = await userRepository.create(userDetails);
        userId = newUser.id;

        // Get access token from AWS by cognito id
        cognitoAccessToken = await this.cognitoIdentityService.getIdToken(cognitoUser.Username);
      }

      const user = {
        userId: userId,
        email,
        firstName: name.givenName,
        lastName: name.familyName,
        facebookId: profile.id,
        accessToken,
        refreshToken,
        cognitoAccessToken: cognitoAccessToken
      };
      await this.unitOfWork.completeTransaction();
      done(null, user);
    } catch (error) {
      await this.unitOfWork.rollbackTransaction();
      throw error
      done(null, { redirect: "" });
    }
  }
}
