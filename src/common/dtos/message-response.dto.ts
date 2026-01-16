import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export abstract class MessageResponseDto {
  @Field()
  message: string;
}
