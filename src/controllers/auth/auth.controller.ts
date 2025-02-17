import { Controller, Get, Post, Body, Req, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthService } from 'src/services/auth/auth.service';
import { Response, Request } from 'express';
import { SignUpDto } from 'src/dtos/params/signup-param.dto';
import { ApiBody } from '@nestjs/swagger';
import { SignInDto } from 'src/dtos/params/signin-param.dto';
import { SignUpConfirmationParams } from 'src/dtos/params/signup-confirmation-param.dto';
import { ForgotPasswordParamDto } from 'src/dtos/params/forgot-password-param.dto';
import { ResetPasswordParamsDto } from 'src/dtos/params/reset-password-param.dto';
import { ResendConfirmationCodeParamDto } from 'src/dtos/params/resend-confirmation-code-param.dto';
import { GlobalConfig } from 'src/config/global-config';
import { ConfigService } from '@nestjs/config';
import { FacebookSignupAuthGuard } from 'src/shared/common/guards/facebook-signup/facebook-signup.guard';
import { LogoutParamDto } from 'src/dtos/params/logout-param.dto';
import { GoogleSignupGuard } from 'src/shared/common/guards/google-signup/google-signup.guard';
import { RefreshTokenParamDto } from 'src/dtos/params/refresh-token-param.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('auth')
@SkipThrottle()
export class AuthController {

	constructor(private configService: ConfigService,
		private readonly authService: AuthService
	) { }

	// Google Login
	@Get('google')
	@UseGuards(GoogleSignupGuard)
	googleLogin() {
	}

	// Google Login Callback
	@Get('google/callback')
	@UseGuards(GoogleSignupGuard)
	async googleLoginCallback(@Req() req, @Res() res: Response) {

		const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
		const error = req.query.error;

		if (error) {
			if (error === 'access_denied') {
				const isSuccess = false;
				const redirectUrl =
					`${appUrl}/auth/signin?` +
					`isSuccess=${encodeURIComponent(isSuccess)}`;
				res.redirect(redirectUrl);
				return;
			}
			const isSuccess = false;
			const redirectUrl =
				`${appUrl}/auth/signin?` +
				`isSuccess=${encodeURIComponent(isSuccess)}`;
			res.redirect(redirectUrl);
			return;
		}
		if (!req.user) {
			const isSuccess = false;
			const redirectUrl = `${appUrl}/auth/signin?isSuccess=${encodeURIComponent(isSuccess)}`;
			res.redirect(redirectUrl);
			return;
		}
		const redirectUrl = `${appUrl}/auth/signin?` +
			`firstName=${encodeURIComponent(req.user.firstName)}&` +
			`lastName=${encodeURIComponent(req.user.lastName)}&` +
			`email=${encodeURIComponent(req.user.email)}&` +
			`picture=${encodeURIComponent(req.user.picture)}&` +
			`access_token=${encodeURIComponent(req.user.cognitoIdToken)}&` +
			`refresh_token=${encodeURIComponent(req.user.refreshToken)}&` +
			`userId=${encodeURIComponent(req.user.userId)}`;

		//	this.setCookie(res, req.user.cognitoIdToken);
		res.redirect(redirectUrl);
	}

	// Facebook Login
	@Get('facebook')
	@UseGuards(FacebookSignupAuthGuard)
	async facebookLogin() { }

	// Facebook Login Callback
	@Get('facebook/callback')
	@UseGuards(FacebookSignupAuthGuard)
	async facebookLoginCallback(@Req() req, @Res() res: Response) {
		const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
		const error = req.query.error;
		if (error === 'access_denied') {
			const isSuccess = false;
			const redirectUrl = `${appUrl}/auth/signin?isSuccess=${encodeURIComponent(isSuccess)}`;
			return res.redirect(redirectUrl);
		}
		if (!req.user) {
			const isSuccess = false;
			const redirectUrl = `${appUrl}/auth/signin?isSuccess=${encodeURIComponent(isSuccess)}`;
			res.redirect(redirectUrl);
			return;
		}
		const redirectUrl = `${appUrl}/auth/signin?` +
			`userId=${encodeURIComponent(req.user.userId)}&` +
			`firstName=${encodeURIComponent(req.user.firstName)}&` +
			`lastName=${encodeURIComponent(req.user.lastName)}&` +
			`email=${encodeURIComponent(req.user.email)}&` +
			`picture=${encodeURIComponent(req.user.picture)}&` +
			`access_token=${encodeURIComponent(req.user.cognitoAccessToken)}&` +
			`refresh_token=${encodeURIComponent(req.user.refreshToken)}&` +
			`userId=${encodeURIComponent(req.user.userId)}`;

		//this.setCookie(res, req.user.cognitoAccessToken);

		res.redirect(redirectUrl);
	}


	// User Sign-Up

	@Post('signup')
	@ApiBody({ type: SignUpDto })
	async signUp(@Body() signUpDto: { username: string; email: string; password: string }) {
		const details = await this.authService.signUp(signUpDto.username, signUpDto.email, signUpDto.password);
		return {
			message: 'Your account has been successfully created. Please check your email to verify your account with the provided code.',
			data: details,
		};
	}

	// User Sign-In
	@Post('signin')
	@ApiBody({ type: SignInDto })
	async signIn(
		@Body() signInDto: SignInDto,
		@Req() req: Request,
		@Res() res: Response,
	) {
		try {
			const data = await this.authService.signIn(
				signInDto.email,
				signInDto.password,
				signInDto.rememberMe,
			);

			GlobalConfig.secrets = { userId: data.userId.toString() };

			//this.setCookie(res, data.accessToken);

			// if (signInDto.rememberMe === true) {
			// 	res.cookie('refreshToken', data.refreshToken, {
			// 		httpOnly: true,
			// 		secure: true,
			// 		sameSite: 'none',
			// 		domain: this.configService.get('COOKIE_DOMAIN')
			// 	});
			// }

			return res.status(HttpStatus.OK).json({
				StatusCode: 200,
				Message: 'You have successfully signed in. Welcome back!',
				IsSuccess: true,
				Data: data,
			});
		} catch (error) {

			if (error.name === 'NotAuthorizedException') {
				return res.status(HttpStatus.UNAUTHORIZED).json({
					StatusCode: HttpStatus.UNAUTHORIZED,
					Message: 'Incorrect username or password. Please try again.',
					IsSuccess: false,
					Data: null,
				});
			}
			else if (error.name == 'UserNotFoundException') {
				return res.status(HttpStatus.BAD_REQUEST).json({
					StatusCode: HttpStatus.BAD_REQUEST,
					Message: 'Provided email is not registered.',
					IsSuccess: false,
					Data: null,
				});
			}
			else {
				return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
					StatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					Message: 'Internal server error. Please try again later.',
					IsSuccess: false,
					Data: null,
				});
			}
		}
	}

	// Confirm Sign-Up
	@Post('signup/confirmation')
	@ApiBody({ type: SignUpConfirmationParams })
	async confirmSignUp(@Body() confirmDto: { email: string; code: string, password: string }, @Req() req: Request, @Res() res: Response) {
		try {
			const details = await this.authService.confirmSignUp(confirmDto.email, confirmDto.code, confirmDto.password);
			//	this.setCookie(res, details.accessToken);

			return res.json({
				StatusCode: 200,
				Message: 'Your signup has been successfully confirmed. Welcome aboard!',
				IsSuccess: true,
				Data: details,
			});
		}
		catch (error) {

			if (error.name == "ExpiredCodeException" || error.name == "CodeMismatchException") {
				return res.json({
					StatusCode: HttpStatus.BAD_REQUEST,
					Message: "Code you entered is invalid. Please request a new code and try again.",
					IsSuccess: false,
					Data: null,
				});
			}
			else {
				return res.json({
					StatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					Message: "Internal server error. Please try again later.",
					IsSuccess: false,
					Data: null,
				});
			}
		}
	}

	// Resend confirmation code
	@Post('signup/resendConfirmationCode')
	@ApiBody({ type: ResendConfirmationCodeParamDto })
	async resendConfirmationCode(@Body() ResendConfirmationCodeParamDto: { email: string; }) {
		await this.authService.ResendConfirmationCode(ResendConfirmationCodeParamDto.email);
		return {
			message: 'The confirmation code has been successfully resent to your email.',
			data: null,
		};
	}

	// Forget password
	@Post('forgotPassword')
	@ApiBody({ type: ForgotPasswordParamDto })
	async forgotPassword(@Body() ForgotPasswordParamDto: { email: string }) {
		await this.authService.forgotPassword(ForgotPasswordParamDto.email);
		return {
			message: 'Reset link sent to your email.',
			data: null,
		};
	}

	// Reset password
	@Post('resetPassword')
	@ApiBody({ type: ResetPasswordParamsDto })
	async resetPassword(@Body() ResetPasswordParamsDto: { email: string, password: string, code: string }) {
		await this.authService.resetPassword(ResetPasswordParamsDto.email, ResetPasswordParamsDto.password, ResetPasswordParamsDto.code);
		return {
			message: 'Your password has been updated. Please sign in with your new password.',
			data: null,
		};
	}

	@Post('logout')
	@ApiBody({ type: LogoutParamDto })
	async logout(@Body('accessToken') accessToken: string, @Res() res: Response) {
		try {
			await this.authService.globalSignOut(accessToken);
			// res.clearCookie('accessToken', {
			// 	httpOnly: true,
			// 	secure: true,
			// 	sameSite: 'none',
			// 	domain: this.configService.get('COOKIE_DOMAIN')
			// });

			return res.json({
				StatusCode: 200,
				Message: 'You have been logged out.',
				IsSuccess: true,
				Data: null,
			});
		} catch (error) {

			// res.clearCookie('accessToken', {
			// 	httpOnly: true,
			// 	secure: true,
			// 	sameSite: 'none',
			// 	domain: this.configService.get('COOKIE_DOMAIN')
			// });

			return res.json({
				StatusCode: 200,
				Message: 'You have been logged out.',
				IsSuccess: true,
				Data: null,
			});
		}
	}

	// private setCookie(res: Response, accessToken: string) {
	// 	res.cookie('accessToken', accessToken, {
	// 		httpOnly: true,
	// 		secure: true,
	// 		sameSite: 'none',
	// 		maxAge: 60 * 1000,
	// 		domain: this.configService.get('COOKIE_DOMAIN')
	// 	});
	// }

	@Post('refresh-token')
	@ApiBody({ type: RefreshTokenParamDto })
	async refreshToken(@Body('refreshToken') refreshToken: string, @Res() res: Response) {
		try {
			const details = await this.authService.refreshToken(refreshToken);
			//this.setCookie(res, details.accessToken);
			return res.json({
				StatusCode: 200,
				Message: 'Access token refreshed successfully !',
				IsSuccess: true,
				Data: details,
			});
		}
		catch (error) {
			if (error.name == "NotAuthorizedException") {
				return res.json({
					StatusCode: HttpStatus.UNAUTHORIZED,
					Message: "Your session expired .Please Log in again",
					IsSuccess: false,
					Data: null,
				});
			}
			else {
				return res.json({
					StatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					Message: "Internal server error. Please try again later.",
					IsSuccess: false,
					Data: null,
				});
			}

		}
	}
}