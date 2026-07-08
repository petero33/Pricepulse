import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as africastalking from 'africastalking';

@Injectable()
export class AuthService {
  private at: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const username = this.configService.get<string>('AT_USERNAME', 'sandbox');
    const apiKey = this.configService.get<string>('AT_API_KEY');
    if (apiKey) {
      this.at = africastalking({ username, apiKey });
    }
  }

  async generateTokens(userId: string, emailOrPhone: string, role: string) {
    const payload = { sub: userId, username: emailOrPhone, role };
    const accessToken = this.jwtService.sign(payload);

    const refreshPayload = { sub: userId };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<any>('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async requestPhoneOtp(phone: string) {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpRequest.create({
      data: {
        phone,
        otp: hashedOtp,
        expiresAt,
      },
    });

    // Send via Africa's Talking
    if (this.at) {
      try {
        const sms = this.at.SMS;
        await sms.send({
          to: [phone],
          message: `Your PricePulse verification code is: ${otp}. It expires in 5 minutes.`,
          from: this.configService.get<string>('AT_SENDER_ID', 'PricePulse'),
        });
      } catch (err) {
        console.error("Failed to send SMS via Africa's Talking:", err);
        // Fallback for sandbox testing: output OTP in console
        console.log(`[SMS SandBox Fallback] OTP for ${phone} is: ${otp}`);
      }
    } else {
      console.log(`[SMS Sandbox Mode] OTP for ${phone} is: ${otp}`);
    }

    return { message: 'OTP sent successfully', expiresAt };
  }

  async verifyPhoneOtp(phone: string, otp: string) {
    const otpRequest = await this.prisma.otpRequest.findFirst({
      where: {
        phone,
        expiresAt: { gte: new Date() },
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRequest) {
      throw new BadRequestException('Expired or invalid OTP request');
    }

    if (otpRequest.attempts >= 3) {
      throw new BadRequestException('Too many attempts. Request a new OTP');
    }

    const isValid = await bcrypt.compare(otp, otpRequest.otp);
    if (!isValid) {
      await this.prisma.otpRequest.update({
        where: { id: otpRequest.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP');
    }

    await this.prisma.otpRequest.update({
      where: { id: otpRequest.id },
      data: { verified: true },
    });

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          displayName: `User_${phone.slice(-4)}`,
          provider: AuthProvider.PHONE,
          reputationScore: 0.2,
        },
      });
    }

    return this.generateTokens(user.id, phone, user.role);
  }

  async googleLogin(profile: any) {
    const { email, name, picture, id: providerId } = profile;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          displayName: name,
          avatarUrl: picture,
          provider: AuthProvider.GOOGLE,
          providerId,
          reputationScore: 0.2,
        },
      });
    }

    return this.generateTokens(user.id, email, user.role);
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.expiresAt < new Date() ||
      tokenRecord.revokedAt
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke the old token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.email || tokenRecord.user.phone || tokenRecord.user.id,
      tokenRecord.user.role,
    );
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }
}
