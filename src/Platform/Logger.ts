import { LogMessage } from "Model/Contracts";
import { ILogger } from "Model/ILogger";
import { Queue } from "Model/Utils/Queue";

export class Logger implements ILogger {
    private messageQueue: Queue<LogMessage>;

    public log(message: string) {
        this.messageQueue.push( {
            Message: message,
            Timestamp: new Date().getTime()/1000
        })
    }

    public flush(): LogMessage[] {
        return this.messageQueue.flush();
    }
}