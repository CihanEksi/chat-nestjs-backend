import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async create(createUserInput: CreateUserInput) {
    const response = {
      success: false,
      message: 'Invalid credentials',
      user: null,
    };

    const findUser = await this.usersRepository.findOne({
      email: createUserInput.email,
    });

    if (findUser) {
      response.message = 'Invalid credentials'; // for brute force attacks
      return response;
    }

    const createUser = await this.usersRepository.create({
      ...createUserInput,
      password: await this.hashPassword(createUserInput.password),
    });

    if (createUser) {
      response.success = true;
      response.message = 'User created successfully';
      response.user = createUser;
    }

    return response;
  }

  async findAll() {
    return this.usersRepository.find({});
  }

  async findOne(query: mongoose.FilterQuery<mongoose.Document>) {
    return this.usersRepository.findOne(query);
  }

  async update(_id: string, updateUserInput: UpdateUserInput) {
    if (updateUserInput.password) {
      const newPassword = await this.hashPassword(updateUserInput.password);
      updateUserInput.password = newPassword;
    }
    return this.usersRepository.findOneAndUpdate(
      { _id: _id },
      {
        $set: {
          ...updateUserInput,
        },
      },
    );
  }

  async remove(_id: string) {
    return this.usersRepository.findOneAndDelete({ _id: _id });
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email: email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
