import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export abstract class OtpVerifyResponseDto {
  @Field()
  message: string;

  @Field()
  token: string;
}
