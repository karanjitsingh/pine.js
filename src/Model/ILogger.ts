export interface ILogger {
    log(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
}

export abstract class IConfigurableLogger<TConfig> implements ILogger
{
    protected config: TConfig;
    
    abstract log(message?: any, ...optionalParams: any[]): void;
    abstract error(message?: any, ...optionalParams: any[]): void;
    abstract warn(message?: any, ...optionalParams: any[]): void;

    public constructor(config: TConfig)
    {
        this.config = config;
    }

    public updateOptions(config: TConfig)
    {
        this.config = config;
    }
}