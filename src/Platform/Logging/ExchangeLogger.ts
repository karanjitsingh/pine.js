import { ILogger, IConfigurableLogger } from "Model/ILogger";

export interface IExchangeLoggerConfig
{
    Enabled: boolean;
    Exchange: string;
}

export class ExchangeLogger extends IConfigurableLogger<IExchangeLoggerConfig>
{
    log(message?: any, ...optionalParams: any[]): void {
        if(this.config.Enabled)
            console.log(this.config.Exchange + ": " + message, optionalParams);
    }

    error(message?: any, ...optionalParams: any[]): void {
        if(this.config.Enabled)
            console.error(this.config.Exchange + ": " + message, optionalParams);
    }

    warn(message?: any, ...optionalParams: any[]): void {
        if(this.config.Enabled)
            console.warn(this.config.Exchange + ": " + message, optionalParams);
    }

}