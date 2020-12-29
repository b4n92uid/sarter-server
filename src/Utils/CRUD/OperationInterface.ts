import User from "../../Entity/User/User";
import ActivityRecorder from "../ActivityRecorder";

export interface Context {
  user: User;
  activity: ActivityRecorder;
}

export type CrudCallback = (EntityModel: any, args: any) => any;

export type CrudHook = (entity: any, ctx: Context, args: any) => void;

export interface QueryOptions {
  operation: CrudCallback;
}

export interface MutationOptions {
  operation?: CrudCallback;
  post?: CrudHook;
}
