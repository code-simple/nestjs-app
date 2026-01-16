import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RefreshTokenResponseDto {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  expiresIn: number;
}
