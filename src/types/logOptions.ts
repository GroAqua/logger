import { LogData } from "./logData";

export type LogOptions = {
  key: string;
  value: string;
  username: string;
  userId: string;
  callback?: (logData: LogData) => Promise<void>;
};
