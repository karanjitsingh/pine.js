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

/* TTY Colors 

Reset: "\x1b[0m",
Bright: "\x1b[1m",
Dim: "\x1b[2m",
Underscore: "\x1b[4m",
Blink: "\x1b[5m",
Reverse: "\x1b[7m",
Hidden: "\x1b[8m",

FgBlack: "\x1b[30m",
FgRed: "\x1b[31m",
FgGreen: "\x1b[32m",
FgYellow: "\x1b[33m",
FgBlue: "\x1b[34m",
FgMagenta: "\x1b[35m",
FgCyan: "\x1b[36m",
FgWhite: "\x1b[37m",

BgBlack: "\x1b[40m",
BgRed: "\x1b[41m",
BgGreen: "\x1b[42m",
BgYellow: "\x1b[43m",
BgBlue: "\x1b[44m",
BgMagenta: "\x1b[45m",
BgCyan: "\x1b[46m",
BgWhite: "\x1b[47m"

*/