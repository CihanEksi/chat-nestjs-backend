import {
  Controller,
  Post,
  UseGuards,
  Res,
  Body,
  HttpException,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
// import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
// import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() request: Request,
    @Body() authPayload: AuthPayloadDto,
    @CurrentUser() user: User,
    @Res({ passthrough: false }) response: Response,
  ) {
    const tokenResponse = await this.authService.validateUser(authPayload);

    if (tokenResponse.success === false) {
      throw new HttpException('Invalid credentials', 401);
    }

    response.send(tokenResponse);
  }
}
