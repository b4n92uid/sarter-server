import User from "../Entity/User/User";
import ActivityRecorder from "./ActivityRecorder";

export interface Context {
  user: User;
  activity: ActivityRecorder;
}
