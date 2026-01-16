import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CustomNumberIdScalar } from 'src/common/scalars/custom-number-id.scalar';
import { EmailTypesEnum } from '../../email/types/common';
import { User } from 'src/users/entities/user.entity';

registerEnumType(EmailTypesEnum, {
  name: 'EmailTypesEnum',
});

@ObjectType()
@Entity()
export class UserEmailTemplate {
  @Field(() => CustomNumberIdScalar)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @Field(() => EmailTypesEnum)
  @Column({ type: 'enum', enum: EmailTypesEnum })
  emailType: EmailTypesEnum;

  @Field()
  @Column('varchar')
  subject: string;

  @Field()
  @Column('text')
  emailHtml: string;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  constructor(userEmailTemplate: Partial<UserEmailTemplate>) {
    Object.assign(this, userEmailTemplate);
  }
}
