import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateUserDTO } from 'src/users/dto/create.user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @HttpCode(200)
  login(@Body() userDTO: CreateUserDTO) {
    return this.authService.login(userDTO);
  }

  @Post('/register')
  register(@Body() userDTO: CreateUserDTO) {
    return this.authService.register(userDTO);
  }
}
