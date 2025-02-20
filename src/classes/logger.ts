import "../string/string.extensions";
import { ForegroundColor } from "../enums/foregroundColor";
import { Importance } from "../enums/importance";
import { Style } from "../enums/style";
import { BackgroundColor } from "../enums/backgroundColor";
import { Level } from "../enums/level";
import { LogData } from "../types/logData";
import { LogOptions } from "../types/logOptions";
import { tokenize } from "./lexer";
import { TokenType } from "../enums/tokenType";

export class Logger {
  private static _level: Level = Level.INF;

  // eslint-disable-next-line
  private complexFormatMessage(message: any): string {
    if (message === null) return "null";
    if (message === undefined) return "undefined";

    if (typeof message === "object") {
      if (this.getStrictType(message).toLowerCase() === "map") {
        return this.unwrapMap(message);
      }

      if (this.getStrictType(message).toLowerCase() === "set") {
        return this.unwrapSet(message);
      }

      if (this.getStrictType(message).toLowerCase() === "array") {
        return JSON.stringify({
          type: "Array",
          length: message.length,
          data: message,
        });
      }

      if (this.getStrictType(message).toLowerCase() === "error") {
        return JSON.stringify({
          type: "Error",
          length: Object.keys(message).length,
          data: JSON.stringify(
            message.stack || message.message || message.toString(),
          ),
        });
      }

      if (this.getStrictType(message).toLowerCase() === "date") {
        return JSON.stringify({
          type: "Date",
          length: message.toISOString().length,
          data: message.toISOString(),
        });
      }

      if (this.getStrictType(message).toLowerCase() === "regexp") {
        return JSON.stringify({
          type: "RegExp",
          length: message.toString().length,
          data: message.toString(),
        });
      }

      if (this.getStrictType(message).toLowerCase() === "object") {
        const json = {
          type: "Object",
          length: Object.keys(message).length,
          data: { ...message },
        };

        if (!message) {
          Object.assign(json, { data: "{}" });
        }

        return JSON.stringify(json);
      }

      try {
        const msg = JSON.stringify(message);
        if (msg === "{}") {
          return JSON.stringify({
            type: typeof message,
            length: message?.length || 0,
            data: message.toString(),
          });
        }
        return msg;
        // eslint-disable-next-line
      } catch (err: any) {
        return JSON.stringify({
          type: "Error",
          length: 0,
          data: JSON.stringify({
            type: "Error",
            data: JSON.stringify(err?.stack || err?.message || err?.toString()),
          }),
        });
      }
    } else if (typeof message !== "string") {
      return JSON.stringify({
        type: typeof message,
        length: message?.length || 0,
        data: message.toString(),
      });
    }

    return JSON.stringify({
      type: "String",
      length: message?.length || 0,
      data: message,
    });
  }

  // eslint-disable-next-line
  private unwrapMap(map: Map<any, any>): string {
    // eslint-disable-next-line
    const entries: any[] = Array.from(map.entries()).map(([key, value]) => {
      return { key: key, value: value };
    });

    return JSON.stringify({
      type: "Map",
      length: entries.length,
      data: entries,
    });
  }

  // eslint-disable-next-line
  private unwrapSet(set: Set<any>): string {
    // eslint-disable-next-line
    const values: any[] = Array.from(set.values()).map((value) => value);

    return JSON.stringify({ type: "Set", length: values.length, data: values });
  }

  private print(
    message: string,
    importance: string,
    keyValueColor?: ForegroundColor | BackgroundColor,
    logData?: LogData | undefined,
  ) {
    if (logData === undefined) {
      console.log(
        `${new Date().toJSON()} ${"|".magenta().reset()} ${importance} ${"|".magenta().reset()} ${message}`,
      );

      return;
    }

    console.log(
      `${logData.created} ${"|".magenta().reset()} ${importance} ${"|".magenta().reset()}${logData.username ? `${` ( ${logData.username.cyan().reset()}`}${" )"}` : ""} ${logData.key && logData.value ? `[ ${keyValueColor ? keyValueColor : ""}${logData.key.toUpperCase()}: ${logData.value.toUpperCase()}${Style.Reset} ]` : ""} ${message}`,
    );
  }

  // eslint-disable-next-line
  private getStrictType(value: any) {
    return Object.prototype.toString.call(value).slice(8, -1);
  }

  private runCallback(logData: LogData) {
    if (!logData?.callback) {
      return;
    }

    logData
      .callback(logData)
      .then()
      .catch((error) => this.print(error, Importance.ERR.redBg().reset()));
  }

  // eslint-disable-next-line
  private getLogData(message: any, logLevel: string, logOptions?: LogOptions) {
    return {
      ...logOptions,
      message: this.complexFormatMessage(message),
      created: new Date().toJSON(),
      logLevel: logLevel.trim().toLowerCase(),
    };
  }

  // eslint-disable-next-line
  private isValidJSON(str: any) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  private colorizeJson(message: string) {
    return tokenize(message)
      .map((t) => {
        if (t.type === TokenType.StringLiteral) {
          return t.value.replace(/"/g, "'").yellow().reset();
        } else if (t.type === TokenType.BooleanLiteral) {
          return t.value.blue().reset();
        } else if (t.type === TokenType.NullLiteral) {
          return t.value.magenta().reset();
        } else if (t.type === TokenType.NumberLiteral) {
          return t.value.green().reset();
        } else if (t.type === TokenType.Comma || t.type === TokenType.Colon) {
          return (t.value += " ");
        } else if (t.type === TokenType.StringKey) {
          return t.value.replace(/"/g, "");
        }

        return t.value;
      })
      .join("");
  }

  // eslint-disable-next-line
  public debug(message: any, logOptions?: LogOptions) {
    this.debugAsync(message, logOptions)
      .then()
      .catch((error) => this.print(error, Importance.ERR.redBg().reset()));
  }

  // eslint-disable-next-line
  private async debugAsync(message: any, logOptions?: LogOptions) {
    if (Logger._level > Level.DEB) return;

    const logData: LogData = this.getLogData(
      message,
      Importance.DEB,
      logOptions,
    );

    if (logOptions?.shouldColorizeJson && this.isValidJSON(logData.message)) {
      message = this.colorizeJson(logData.message);
    } else {
      message = logData.message;
    }

    this.print(
      message,
      Importance.DEB.blueBg().reset(),
      ForegroundColor.Blue,
      logData,
    );

    this.runCallback(logData);
  }

  // eslint-disable-next-line
  public info(message: any, logOptions?: LogOptions) {
    this.infoAsync(message, logOptions)
      .then()
      .catch((error) => this.print(error, Importance.ERR.redBg().reset()));
  }

  // eslint-disable-next-line
  private async infoAsync(message: any, logOptions?: LogOptions) {
    if (Logger._level > Level.INF) return;

    const logData: LogData = this.getLogData(
      message,
      Importance.INF,
      logOptions,
    );

    if (logOptions?.shouldColorizeJson && this.isValidJSON(logData.message)) {
      message = this.colorizeJson(logData.message);
    } else {
      message = logData.message;
    }

    this.print(
      message,
      Importance.INF.greenBg().reset(),
      ForegroundColor.Green,
      logData,
    );

    this.runCallback(logData);
  }

  // eslint-disable-next-line
  public error(message: any, logOptions?: LogOptions) {
    this.errorAsync(message, logOptions)
      .then()
      .catch((error) => this.print(error, Importance.ERR.redBg().reset()));
  }

  // eslint-disable-next-line
  private async errorAsync(message: any, logOptions?: LogOptions) {
    if (Logger._level > Level.ERR) return;

    const logData: LogData = this.getLogData(
      message,
      Importance.ERR,
      logOptions,
    );

    if (logOptions?.shouldColorizeJson && this.isValidJSON(logData.message)) {
      message = this.colorizeJson(logData.message);
    } else {
      message = logData.message;
    }

    this.print(
      message,
      Importance.ERR.redBg().reset(),
      ForegroundColor.Red,
      logData,
    );

    this.runCallback(logData);
  }

  // eslint-disable-next-line
  public warn(message: any, logOptions?: LogOptions) {
    this.warnAsync(message, logOptions)
      .then()
      .catch((error) => this.print(error, Importance.ERR.redBg().reset()));
  }

  // eslint-disable-next-line
  private async warnAsync(message: any, logOptions?: LogOptions) {
    if (Logger._level > Level.WAR) return;

    const logData: LogData = this.getLogData(
      message,
      Importance.WAR,
      logOptions,
    );

    if (logOptions?.shouldColorizeJson && this.isValidJSON(logData.message)) {
      message = this.colorizeJson(logData.message);
    } else {
      message = logData.message;
    }

    this.print(
      message,
      Importance.WAR.yellowBg().reset(),
      ForegroundColor.Yellow,
      logData,
    );

    this.runCallback(logData);
  }

  // eslint-disable-next-line
  public fatal(message: any, logOptions?: LogOptions) {
    this.fatalAsync(message, logOptions)
      .then()
      .catch((error) => this.print(error, Importance.ERR.redBg().reset()));
  }

  // eslint-disable-next-line
  private async fatalAsync(message: any, logOptions?: LogOptions) {
    if (Logger._level > Level.FAT) return;

    const logData: LogData = this.getLogData(
      message,
      Importance.FAT,
      logOptions,
    );

    if (logOptions?.shouldColorizeJson && this.isValidJSON(logData.message)) {
      message = this.colorizeJson(logData.message);
    } else {
      message = logData.message;
    }

    this.print(
      message,
      Importance.FAT.magentaBg().reset(),
      ForegroundColor.Magenta,
      logData,
    );

    this.runCallback(logData);
  }

  public static setLevel(level: Level) {
    this._level = level;
  }
}
