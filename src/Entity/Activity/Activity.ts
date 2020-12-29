import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

import User from "../User/User";

@Entity({ name: "activity" })
export default class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;

  @Column()
  level: number;

  @Column()
  content: string;

  @Column("json")
  params: any;

  @Column()
  ip: string;

  @Column()
  hostname: string;

  @Column()
  machineId: string;
}
