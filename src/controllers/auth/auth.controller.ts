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
import { UserService } from 'src/services/user/user.service';
import { GlobalConfig } from 'src/config/global-config';
import { FacebookService } from 'src/services/facebook/facebook.service';
import { ConfigService } from '@nestjs/config';
import { FacebookSignupAuthGuard } from 'src/shared/common/guards/facebook-signup/facebook-signup.guard';
import { GoogleSignupGuard } from 'src/shared/common/guards/google-signup/google-signup.guard';
import { LogoutParamDto } from 'src/dtos/params/logout-param.dto';

@Controller('auth')
export class AuthController {

	constructor(private configService: ConfigService, private readonly authService: AuthService, private readonly userService: UserService, private readonly facebookService: FacebookService
	) { }

	// Google Login
	@Get('google')
	@UseGuards(GoogleSignupGuard)
	googleLogin() { }

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
		}

		const redirectUrl = `${appUrl}/auth/signin?` +
			`userId=${encodeURIComponent(req.user.userId)}&` +
			`firstName=${encodeURIComponent(req.user.firstName)}&` +
			`lastName=${encodeURIComponent(req.user.lastName)}&` +
			`email=${encodeURIComponent(req.user.email)}&` +
			`picture=${encodeURIComponent(req.user.picture)}&` +
			`access_token=${encodeURIComponent(req.user.cognitoIdToken)}&` +
			`refresh_token=${encodeURIComponent(req.user.refreshToken)}`;

		this.setCookie(res, req.user.cognitoIdToken);

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

		const redirectUrl = `${appUrl}/auth/signin?` +
			`firstName=${encodeURIComponent(req.user.firstName)}&` +
			`lastName=${encodeURIComponent(req.user.lastName)}&` +
			`email=${encodeURIComponent(req.user.email)}&` +
			`picture=${encodeURIComponent(req.user.picture)}&` +
			`access_token=${encodeURIComponent(req.user.cognitoAccessToken)}&` +
			`refresh_token=${encodeURIComponent(req.user.refreshToken)}`;

		this.setCookie(res, req.user.cognitoAccessToken);

		res.redirect(redirectUrl);
	}


	// User Sign-Up
	@Post('signup')
	@ApiBody({ type: SignUpDto })
	async signUp(@Body() signUpDto: { username: string; email: string; password: string }) {
		const details = await this.authService.signUp(signUpDto.username, signUpDto.email, signUpDto.password);
		return {
			message: 'Signup successfully',
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

			req.session.userId = data.userId.toString();
			GlobalConfig.secrets = { userId: data.userId.toString() };

			this.setCookie(res, data.accessToken);

			return res.status(HttpStatus.OK).json({
				StatusCode: 200,
				Message: 'Sign in successfully',
				IsSuccess: true,
				Data: data,
			});
		} catch (error) {
			if (error.name === 'NotAuthorizedException') {
				return res.status(HttpStatus.UNAUTHORIZED).json({
					StatusCode: HttpStatus.UNAUTHORIZED,
					Message: 'Incorrect username or password.',
					IsSuccess: false,
					Data: null,
				});
			} else {
				return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
					StatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					Message: 'An error occurred during sign-in.',
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
			this.setCookie(res, details.accessToken);

			return res.json({
				StatusCode: 200,
				Message: 'Signup confirmation successfully',
				IsSuccess: true,
				Data: details,
			});
		}
		catch (error) {
			return res.json({
				StatusCode: HttpStatus.BAD_REQUEST,
				Message: error,
				IsSuccess: false,
				Data: null,
			});
		}
	}

	// Resend confirmation code
	@Post('signup/resendConfirmationCode')
	@ApiBody({ type: ResendConfirmationCodeParamDto })
	async resendConfirmationCode(@Body() ResendConfirmationCodeParamDto: { email: string; }) {
		const details = await this.authService.ResendConfirmationCode(ResendConfirmationCodeParamDto.email);
		return {
			message: 'Confirmation code resend successfully',
			data: details,
		};
	}

	// Forget password
	@Post('forgotPassword')
	@ApiBody({ type: ForgotPasswordParamDto })
	async forgotPassword(@Body() ForgotPasswordParamDto: { email: string }) {
		const details = await this.authService.forgotPassword(ForgotPasswordParamDto.email);
		return {
			message: 'Password forgot successfully',
			data: details,
		};
	}

	// Reset password
	@Post('resetPassword')
	@ApiBody({ type: ResetPasswordParamsDto })
	async resetPassword(@Body() ResetPasswordParamsDto: { email: string, password: string, code: string }) {
		const details = await this.authService.resetPassword(ResetPasswordParamsDto.email, ResetPasswordParamsDto.password, ResetPasswordParamsDto.code);
		return {
			message: 'Password reset successfully',
			data: details,
		};
	}

	@Post('logout')
	@ApiBody({ type: LogoutParamDto })
	async logout(@Body('accessToken') accessToken: string, @Res() res: Response) {
		try {
			await this.authService.globalSignOut(accessToken);
			res.clearCookie('accessToken', {
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				domain: this.configService.get('COOKIE_DOMAIN')
			});

			return res.json({
				StatusCode: 200,
				Message: 'Logout successfully',
				IsSuccess: true,
				Data: null,
			});
		} catch (error) {
			return res.json({
				StatusCode: HttpStatus.BAD_REQUEST,
				Message: error,
				IsSuccess: false,
				Data: null,
			});
		}
	}

	private setCookie(res: Response, accessToken: string) {
		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
			domain: this.configService.get('COOKIE_DOMAIN')
		});
	}
}