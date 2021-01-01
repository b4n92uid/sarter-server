import { IsEmail, IsIn, IsIP, IsNotEmpty } from "class-validator";
import { createHash } from "crypto";
import { differenceInSeconds } from "date-fns";
import { flatMap, pick, some, isArray } from "lodash";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

import { readConfig } from "../../Utils/Config";
import { getUploadUrl } from "../../Utils/Uploads";

interface StringMap {
  [s: string]: Array<string>;
}

const SecurityRoles = readConfig("security.yaml") as StringMap;

@Entity({ name: "user" })
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  fullname?: string;

  @Column({ unique: true, nullable: false })
  @IsNotEmpty()
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  @IsEmail()
  mail?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  lastActivityAt?: Date;

  @Column({ nullable: true })
  @IsIP()
  lastIp?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column("json")
  @IsIn(Object.keys(SecurityRoles), { each: true, message: "USER/UNREGISTERED_ROLE" })
  roles: string[];

  @Column({ nullable: false, default: false })
  isActive?: boolean;

  avatarUrl() {
    if (this.avatar) return getUploadUrl("user", this.avatar);
    return null;
  }

  hashPassword(password: string): void {
    this.password = User.generateHashPassword(password);
  }

  isPasswordValid(password: string): boolean {
    return User.generateHashPassword(password) === this.password;
  }

  isGranted(access: string | string[]): boolean {
    if (!isArray(access)) access = [access as string];

    if (this.roles === null) return false;

    if (this.roles.includes("ADMIN")) {
      return true;
    }
    const rolesTree = pick(SecurityRoles, this.roles);
    const allAccess = flatMap(rolesTree, v => v);

    return some(access, a => allAccess.includes(a));
  }

  isAdmin() {
    return this.isGranted("ADMIN");
  }

  isOnline() {
    if (this.lastActivityAt !== null)
      return differenceInSeconds(new Date(), this.lastActivityAt) < 30;
    else return false;
  }

  static generateHashPassword(password: string): string {
    if (!password) return null;

    return createHash("sha256").update(password).digest("hex");
  }
}
