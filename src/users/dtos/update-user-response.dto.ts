import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class UpdateUserResponseDto {
  @Field()
  message: string;

  @Field()
  user: User;
}
