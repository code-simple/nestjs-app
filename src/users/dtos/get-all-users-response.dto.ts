import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class UserListResponse {
  @Field(() => [User])
  users: User[];

  @Field(() => Int)
  totalRecords: number;
}
