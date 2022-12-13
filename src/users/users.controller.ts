import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { QueryDto } from './dto/users.dto';
import { UsersService } from './users.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  @Inject(UsersService)
  private readonly usersService: UsersService;

  @Get()
  findAll(@Query() query: QueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
  }
}
