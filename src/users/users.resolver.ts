import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './providers/users.service';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthCheckGuard } from 'src/auth/guards/auth-check.guard';
import { UserListResponse } from './dtos/get-all-users-response.dto';
import { SortInput } from 'src/common/dtos/sort-input.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthCheckGuard)
  @Query(() => [User])
  async getAllUsersWithoutPagination(
    @Args('userRole', { type: () => Number, nullable: true })
    userRole,
  ) {
    try {
      return await this.usersService.findAll(userRole);
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }

  @UseGuards(AuthCheckGuard)
  @Query(() => UserListResponse)
  async getAllUsers(
    @Args('userRole', { type: () => Number, nullable: true })
    userRole,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize = 10,
    @Args('filterBy', { type: () => String, nullable: true }) filterBy?: string,
    @Args('filter', { type: () => String, nullable: true }) filter?: string,
    @Args('sort', { type: () => SortInput, nullable: true })
    sort?: {
      field: string;
      direction: 'ASC' | 'DESC';
    },
  ) {
    try {
      const [users, totalRecords] = await this.usersService.findAllWithRelations({
        userRole,
        page,
        pageSize,
        filterBy,
        filter,
        sort,
      });

      return { users, totalRecords };
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }

  @UseGuards(AuthCheckGuard)
  @Query(() => User)
  async getUserById(@Args('userId') userId: number) {
    try {
      return this.usersService.findOneWithRelations(userId, []);
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }
}
