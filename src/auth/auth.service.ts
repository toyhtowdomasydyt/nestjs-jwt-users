import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from 'src/users/dto/create.user.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.model';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(userDTO: CreateUserDTO) {
    const user = await this.validateUser(userDTO);
    return { success: true, ...(await this.generateToken(user)) };
  }

  async register(userDTO: CreateUserDTO) {
    const isUser = await this.userService.getUserByLogin(userDTO.login);

    if (isUser) {
      throw new HttpException(
        `User with login: ${userDTO.login} is already exist`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(userDTO.password, 5);
    const user = await this.userService.createUser({
      ...userDTO,
      password: hashPassword,
    });

    return { success: true, ...(await this.generateToken(user)) };
  }

  private async generateToken(user: User) {
    const payload = { login: user.login, id: user.id };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(userDTO: CreateUserDTO) {
    const user = await this.userService.getUserByLogin(userDTO.login);
    const isPasswordEqual = await bcrypt.compare(
      userDTO.password,
      user.password,
    );

    if (user && isPasswordEqual) {
      return user;
    }

    throw new UnauthorizedException({
      message: 'Wrong login or password',
    });
  }
}
