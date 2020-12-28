import { LogMessage, LogType } from "Model/Contracts";
import { IConfigurableLogger as ConfigurableLogger, ILogger } from "Model/ILogger";
import { Queue } from "Model/Utils/Queue";


export interface IReporterLoggingConfig
{

}

export class ReportingLogger extends ConfigurableLogger<IReporterLoggingConfig> {

    private messageQueue: Queue<LogMessage>;

    public error(message?: any, ...optionalParams: any[]): void {
        this.pushLog(LogType.Error, message, optionalParams);
    }
    
    public warn(message?: any, ...optionalParams: any[]): void {
        this.pushLog(LogType.Warning, message, optionalParams);
    }

    public log(message?: any, ...optionalParams: any[]) {
        this.pushLog(LogType.Info, message, optionalParams);
    }

    public flush(): LogMessage[] {
        return this.messageQueue.flush();
    }

    private pushLog(type: LogType, message?: any, ...params: any[])
    {
        var messageString = "";
        if(message)
            messageString = String(message);

        if(params && params.length)
        {
            messageString += " " + params.join(" ");
        }

        this.messageQueue.push( {
            LogType: type,
            Message: messageString,
            Timestamp: new Date().getTime() / 1000
        });
    }
}
