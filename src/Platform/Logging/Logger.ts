import { LogMessage, LogType } from "Model/Contracts";
import { ILogger } from "Model/ILogger";
import { Queue } from "Model/Utils/Queue";
import { config } from "process";
import { ExchangeLogger, IExchangeLoggerConfig } from "./ExchangeLogger";
import { IReporterLoggingConfig, ReportingLogger } from "./ReportingLogger";
import { IServerLoggingConfig, ServerLogger } from "./ServerLogger";

export class Logger {
    private static defaultConfig: LoggingConfig = {
        ReporterLogging: {},
        ServerLogging: {
            Enabled: false,
            Prefix: "Server: ",
        },
        ExchangeLogging: {
            Enabled: true,
            Exchange: "Testnet.Bybit"
        }
    };

    public static Reporter: ReportingLogger = new ReportingLogger(Logger.defaultConfig.ReporterLogging);
    public static Server: ServerLogger = new ServerLogger(Logger.defaultConfig.ServerLogging);
    public static Exchange: ExchangeLogger = new ExchangeLogger(Logger.defaultConfig.ExchangeLogging);
}

export interface LoggingConfig {
    ReporterLogging: IReporterLoggingConfig;
    ServerLogging: IServerLoggingConfig;
    ExchangeLogging: IExchangeLoggerConfig;
}