export type LogData = {
  apiMethod?: string;
  apiPath?: string;
  created?: string;
  hostname?: string;
  ip?: string;
  key?: string;
  logLevel?: string;
  serviceName?: string;
  statusCode?: number;
  statusMessage?: string;
  userId?: string;
  username?: string;
  value?: string;
  callback?: (logData: LogData) => Promise<void>;
};
