import * as fs from 'fs';
import { PlatformConfiguration, Resolution } from "Model/Contracts";
import { Tick } from "Model/InternalContracts";
import * as path from 'path';

export namespace Utils {
    export const GetTestConfig = (): PlatformConfiguration  => {
        const config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", ".." , ".testconfig.json")).toString()) as PlatformConfiguration;

        if(!Utils.Validations.ValidateBotConfig(config)) {
            throw new Error('Invalid config.');
        }

        return config;
    }

    export const GetResolutionTick = (resolution: Resolution): number => {
        const match = resolution.match(/^([0-9]+)(.)$/);
        if(!match) {
            throw new Error(`Invalid resolution '${resolution}'`);
        }
    
        const quantum = parseInt(match[1]);
    
        switch(match[2]) {
            case "m":
                return Tick.Minute * quantum;
            case "d":
                return Tick.Day * quantum;
            case "w":
                return Tick.Week * quantum;
            default:
                throw new Error(`Unsupported resolution '${resolution}'`);
        }
    }

    export namespace Validations {
        export const ValidateBotConfig = (config: PlatformConfiguration) => {
            if (!config) {
                return false;
            }
    
            if (!config.Exchange || !config.Strategy || !(!!config.BacktestSettings || !!config.ExchangeAuth)) {
                return false;
            }
            
            if(config.ExchangeAuth) {
                return config.ExchangeAuth.ApiKey && config.ExchangeAuth.Secret;
            }
    
            return true;
        }
    }
}

    