import { Subscribable } from "Model/Events";

export enum MessageSeverity {
    Verbose,
    Nominal,
    Severe
}

export interface MessageLog {
    Severity: MessageSeverity;
    Message: string;
}

export class MessageLogger extends Subscribable<MessageLog[]> {
    private promiseToken: number;
    private messageQueue: MessageLog[]
    
    public constructor() {
        super();
        this.messageQueue = [];
    }

    public verbose(message: string) {
        this.log(message, MessageSeverity.Nominal);
    }

    public nominal(message: string) {
        this.log(message, MessageSeverity.Nominal);
    }
    
    public severe(message: string) {
        this.log(message, MessageSeverity.Severe);
    }

    private log(str: string, severity: MessageSeverity) {
        this.messageQueue.push({
            Severity: severity,
            Message: str
        });

        const token = this.promiseToken = Math.random();
        new Promise((resolve) => {
            if(token == this.promiseToken) {
                this.notifyAll(this.messageQueue.splice(0, this.messageQueue.length))
                this.promiseToken = 0;
            };
        });
    }
}