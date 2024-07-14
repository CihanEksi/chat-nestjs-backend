import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const loginResponse = await this.authService.validateUser({
        email,
        password,
      });

      if (loginResponse.success === false) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const user = loginResponse.user;
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials'); // for brute force attacks
    }
  }
}
