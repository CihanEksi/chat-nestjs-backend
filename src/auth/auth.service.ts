import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { User } from 'src/users/entities/user.entity';
import * as moment from 'moment';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { AuthPayloadDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { userMapperForClient } from '../users/mappers/users.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(user: User, response: Response) {
    const jwtExpiration = this.configService.get('JWT_EXPIRATION_TIME');
    const expires = moment().add(+jwtExpiration, 's').toDate();

    const tokenPayload: TokenPayload = {
      _id: user._id.toHexString(),
      email: user.email,
    };

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires: expires,
    });

    response.send({
      token,
      user: userMapperForClient(user),
      success: true,
      message: 'Login successful',
    });
  }

  async validateUser(payload: AuthPayloadDto) {
    const { email, password } = payload;
    const findUser = await this.usersService.findOne({
      email: email,
    });

    const response = {
      success: false,
      message: 'Invalid credentials',
      token: null,
      user: null,
    };

    if (!findUser) {
      return response;
    }

    const passwordIsValid = await bcrypt.compare(password, findUser.password);

    if (!passwordIsValid) {
      return response;
    }

    if (passwordIsValid) {
      const token = this.jwtService.sign({
        _id: findUser._id.toHexString(),
        email: email,
      });

      response.success = true;
      response.message = 'Login successful';
      response.token = token;
      response.user = {
        ...findUser,
        password: undefined,
      };
      return response;
    }

    return response;
  }
}
