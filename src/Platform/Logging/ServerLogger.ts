import { ILogger, IConfigurableLogger } from "Model/ILogger";

export interface IServerLoggingConfig
{
    Enabled: boolean;
    Prefix: string;
}

export class ServerLogger extends IConfigurableLogger<IServerLoggingConfig>
{
    log(message?: any, ...optionalParams: any[]): void {
        if(this.config.Enabled)
            console.log(this.config.Prefix + message, optionalParams);
    }

    error(message?: any, ...optionalParams: any[]): void {
        if(this.config.Enabled)
            console.error(this.config.Prefix + message, optionalParams);
    }

    warn(message?: any, ...optionalParams: any[]): void {
        if(this.config.Enabled)
            console.warn(this.config.Prefix + message, optionalParams);
    }

}