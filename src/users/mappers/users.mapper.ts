import { User } from '../entities/user.entity';

export interface UserForClient extends Omit<User, 'password'> {
  password: undefined;
}

const userMapperForClient = (user: User): UserForClient => {
  return {
    ...user,
    password: undefined,
  };
};

export { userMapperForClient };
