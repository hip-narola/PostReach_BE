import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/services/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
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
@Controller('auth')
export class AuthController {

	constructor(private configService: ConfigService, private readonly authService: AuthService, private readonly userService: UserService, private readonly facebookService: FacebookService
	) { }

	// Google Login
	@Get('google')
	@UseGuards(AuthGuard('google'))
	googleLogin() { }

	// Google Login Callback
	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	async googleLoginCallback(@Req() req, @Res() res: Response) {

		const appUrl= this.configService.get<string>('APP_URL_FRONTEND');
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

		res.cookie('accessToken', req.user.cognitoIdToken, {
			httpOnly: true,
			secure: false,
			maxAge: null,
		});

		res.redirect(redirectUrl);
	}

	// Facebook Login
	@Get('facebook')
	@UseGuards(AuthGuard('facebook'))
	async facebookLogin() { }

	// Facebook Login Callback
	@Get('facebook/callback')
	@UseGuards(AuthGuard('facebook'))
	async facebookLoginCallback(@Req() req, @Res() res: Response) {
		const appUrl= this.configService.get<string>('APP_URL_FRONTEND');
		const error = req.query.error;
		// Check for access_denied error
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

		res.cookie('accessToken', req.user.cognitoAccessToken, {
			httpOnly: true,
			secure: false,
			maxAge: null,
		});

		res.redirect(redirectUrl);
	}


	// User Sign-Up
	@Post('signup')
	@ApiBody({ type: SignUpDto })
	async signUp(@Body() signUpDto: { username: string; email: string; password: string }) {
		return await this.authService.signUp(signUpDto.username, signUpDto.email, signUpDto.password);
	}

	// User Sign-In
	@Post('signin')
	@ApiBody({ type: SignInDto })
	async signIn(@Body() signInDto: { email: string; password: string, rememberMe?: boolean }, @Req() req: Request, @Res() res: Response) {
		const data = await this.authService.signIn(signInDto.email, signInDto.password, signInDto.rememberMe);
		req.session.userId = data.userId.toString();
		GlobalConfig.secrets = { userId: data.userId.toString() };
		res.cookie('accessToken', data.accessToken, {
			httpOnly: true,
			secure: false,
			maxAge: null,
		});
		return res.json({
			StatusCode: 200,
			Message: '',
			IsSuccess: true,
			Data: data,
		});
	}

	// Confirm Sign-Up
	@Post('signup/confirmation')
	@ApiBody({ type: SignUpConfirmationParams })
	async confirmSignUp(@Body() confirmDto: { email: string; code: string, password: string }) {
		return await this.authService.confirmSignUp(confirmDto.email, confirmDto.code, confirmDto.password);
	}

	// Resend confirmation code
	@Post('signup/resendConfirmationCode')
	@ApiBody({ type: ResendConfirmationCodeParamDto })
	async resendConfirmationCode(@Body() ResendConfirmationCodeParamDto: { email: string; }) {
		return await this.authService.ResendConfirmationCode(ResendConfirmationCodeParamDto.email);

	}

	// Forget password
	@Post('forgotPassword')
	@ApiBody({ type: ForgotPasswordParamDto })
	async forgotPassword(@Body() ForgotPasswordParamDto: { email: string }) {
		return await this.authService.forgotPassword(ForgotPasswordParamDto.email);
	}

	// Reset password
	@Post('resetPassword')
	@ApiBody({ type: ResetPasswordParamsDto })
	async resetPassword(@Body() ResetPasswordParamsDto: { email: string, password: string, code: string }) {
		return await this.authService.resetPassword(ResetPasswordParamsDto.email, ResetPasswordParamsDto.password, ResetPasswordParamsDto.code);
	}
}