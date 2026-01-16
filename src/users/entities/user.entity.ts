import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType, HideField } from '@nestjs/graphql';
import { CustomNumberIdScalar } from 'src/common/scalars/custom-number-id.scalar';

@ObjectType()
@Entity()
export class User {
  @Field(() => CustomNumberIdScalar)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('varchar')
  name: string;

  @Field()
  @Column('varchar', { unique: true })
  email: string;

  @HideField()
  @Column('varchar', { nullable: true })
  password: string;

  @Field({ nullable: true })
  @Column('varchar', { nullable: true })
  profileImage?: string;

  @Field({ defaultValue: false })
  @Column('boolean', { default: false })
  isEmailVerified: boolean;

  @Field()
  @Column('varchar')
  otpSecret: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Field({ nullable: true })
  @Column('varchar', { nullable: true })
  phoneNumber?: string;

  @Field({ defaultValue: false })
  @Column('boolean', { default: false })
  isGhostUser: boolean;

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }
}
