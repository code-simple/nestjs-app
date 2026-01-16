import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateEmailTemplateInput {
  @Field()
  emailTemplateId: number;

  @Field({ nullable: true })
  subject: string;

  @Field({ nullable: true })
  emailHtml: string;
}
