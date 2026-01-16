import { Field, ObjectType } from '@nestjs/graphql';
import { RefreshTokenResponseDto } from './refresh-token-response.dto';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class LoginResponseDto {
  @Field()
  user: User;

  @Field()
  authTokens: RefreshTokenResponseDto;
}
