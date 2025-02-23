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
import { LogFormat } from "../types/logFormat";
import { DataType } from "../enums/dataType";

export class Logger {
  private static _level: Level = Level.INF;
  // eslint-disable-next-line
  private _dataTypeParserMap: Map<string, (message: any) => LogFormat> =
    new Map();

  constructor() {
    this.initDataTypeParserMap();
  }

  private initDataTypeParserMap() {
    this._dataTypeParserMap.set(DataType.OBJECT, this.parseObject);
    this._dataTypeParserMap.set(DataType.ERROR, this.parseError);
    this._dataTypeParserMap.set(DataType.MAP, this.parseMap);
    this._dataTypeParserMap.set(DataType.SET, this.parseSet);
    this._dataTypeParserMap.set(DataType.ARRAY, this.parseArray);
    this._dataTypeParserMap.set(DataType.DATE, this.parseDate);
    this._dataTypeParserMap.set(DataType.REGEXP, this.parseRegExp);
  }

  // eslint-disable-next-line
  private parseError(error: any): LogFormat {
    if (this.isValidJSON(error)) {
      return {
        length: Object.keys(error).length,
        type: DataType.ERROR,
        data: error,
      };
    }

    if (typeof error !== "string") {
      const data = { message: error?.message || "", stack: error?.stack || "" };
      return {
        type: DataType.ERROR,
        length: Object.keys(data).length,
        data: data,
      };
    }

    return {
      type: DataType.ERROR,
      length: error.length,
      data: error,
    };
  }

  // eslint-disable-next-line
  private complexFormatMessage(message: any): LogFormat {
    if (message === null) return { type: "null", length: 0, data: null };
    if (message === undefined)
      return { type: "undefined", length: 0, data: null };

    if (typeof message === "object") {
      if (
        this._dataTypeParserMap.has(this.getStrictType(message).toLowerCase())
      ) {
        return this._dataTypeParserMap.get(
          this.getStrictType(message).toLowerCase(),
        )!(message);
      }

      try {
        const msg = JSON.stringify(message);
        if (msg === "{}") {
          return {
            type: typeof message,
            length: message?.length || 0,
            data: message.toString(),
          };
        }
        return {
          type: typeof message,
          length: message?.length || 0,
          data: JSON.parse(msg),
        };
        // eslint-disable-next-line
      } catch (err: any) {
        return this.parseError(message);
      }
    } else if (typeof message !== "string") {
      return {
        type: typeof message,
        length: message?.length || 0,
        data: message.toString(),
      };
    }

    return {
      type: DataType.STRING,
      length: message?.length || 0,
      data: message,
    };
  }

  // eslint-disable-next-line
  private parseObject(message: any): LogFormat {
    const json = {
      type: DataType.OBJECT,
      length: Object.keys(message).length,
      data: { ...message },
    };

    if (!message) {
      Object.assign(json, { data: "{}" });
    }

    return json;
  }

  // eslint-disable-next-line
  private parseRegExp(message: any): LogFormat {
    return {
      type: DataType.REGEXP,
      length: message.toString().length,
      data: message.toString(),
    };
  }

  // eslint-disable-next-line
  private parseDate(message: any): LogFormat {
    return {
      type: DataType.DATE,
      length: message.toISOString().length,
      data: message.toISOString(),
    };
  }

  // eslint-disable-next-line
  private parseArray(message: any): LogFormat {
    return {
      type: DataType.ARRAY,
      length: message.length,
      data: message,
    };
  }

  // eslint-disable-next-line
  private parseMap(message: any): LogFormat {
    // eslint-disable-next-line
    const map = message as Map<any, any>;
    // eslint-disable-next-line
    const entries: any[] = Array.from(map.entries()).map(([key, value]) => {
      return { key: key, value: value };
    });

    return {
      type: DataType.MAP,
      length: entries.length,
      data: entries,
    };
  }

  // eslint-disable-next-line
  private parseSet(message: any): LogFormat {
    // eslint-disable-next-line
    const set = message as Set<any>;
    // eslint-disable-next-line
    const values: any[] = Array.from(set.values()).map((value) => value);

    return { type: DataType.SET, length: values.length, data: values };
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

  private runCallback(logData: LogData, logOptions?: LogOptions) {
    if (!logData?.callback) {
      return;
    }

    logData
      .callback(logData)
      .then()
      .catch((error) => {
        this.printError(error, logOptions);
      });
  }

  // eslint-disable-next-line
  private printError(error: any, logOptions?: LogOptions) {
    const logData: LogData = this.getLogData(error, Importance.INF, logOptions);

    const message = this.getMessage(logData, logOptions);

    this.print(
      message,
      Importance.ERR.redBg().reset(),
      ForegroundColor.Red,
      logData,
    );
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

  private getMessage(logData: LogData, logOptions?: LogOptions) {
    if (
      logOptions?.shouldColorizeJson &&
      this.isValidJSON(JSON.stringify(logData.message))
    ) {
      return this.colorizeJson(
        JSON.stringify(
          logOptions?.verbose ? logData.message : logData.message.data,
        ),
      );
    }

    return JSON.stringify(
      logOptions?.verbose ? logData.message : logData.message.data,
    );
  }

  // eslint-disable-next-line
  public debug(message: any, logOptions?: LogOptions) {
    if (Logger._level > Level.DEB) return;

    const logData: LogData = this.getLogData(
      message,
      Importance.DEB,
      logOptions,
    );

    this.print(
      this.getMessage(logData, logOptions),
      Importance.DEB.blueBg().reset(),
      ForegroundColor.Blue,
      logData,
    );

    this.runCallback(logData, logOptions);
  }

  // eslint-disable-next-line
  public info(message: any, logOptions?: LogOptions) {
    if (Logger._level > Level.INF) return;

    const logData: LogData = this.getLogData(
      message,
      Importance.INF,
      logOptions,
    );

    this.print(
      this.getMessage(logData, logOptions),
      Importance.INF.greenBg().reset(),
      ForegroundColor.Green,
      logData,
    );

    this.runCallback(logData, logOptions);
  }

  // eslint-disable-next-line
  public warn(message: any, logOptions?: LogOptions) {
    if (Logger._level > Level.WAR) return;

    const logData: LogData = this.getLogData(
      message,
      Importance.WAR,
      logOptions,
    );

    this.print(
      this.getMessage(logData, logOptions),
      Importance.WAR.yellowBg().reset(),
      ForegroundColor.Yellow,
      logData,
    );

    this.runCallback(logData, logOptions);
  }

  // eslint-disable-next-line
  public error(message: any, logOptions?: LogOptions) {
    if (Logger._level > Level.ERR) return;

    const logData: LogData = this.getLogData(
      message,
      Importance.ERR,
      logOptions,
    );

    this.print(
      this.getMessage(logData, logOptions),
      Importance.ERR.redBg().reset(),
      ForegroundColor.Red,
      logData,
    );

    this.runCallback(logData, logOptions);
  }

  // eslint-disable-next-line
  public fatal(message: any, logOptions?: LogOptions) {
    if (Logger._level > Level.FAT) return;

    const logData: LogData = this.getLogData(
      message,
      Importance.FAT,
      logOptions,
    );

    this.print(
      this.getMessage(logData, logOptions),
      Importance.FAT.magentaBg().reset(),
      ForegroundColor.Magenta,
      logData,
    );

    this.runCallback(logData, logOptions);
  }

  public static setLevel(level: Level) {
    this._level = level;
  }
}
