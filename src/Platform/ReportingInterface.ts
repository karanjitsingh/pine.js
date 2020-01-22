import { Glyph, LogMessage, CandleGlyph as LogGlyph, Timestamp } from "../Model/Contracts";
import { Queue } from "Model/Utils/Queue";

export class ReportingInterface {
    private messageQueue: Queue<LogMessage>;
    private glyphQueue: Queue<LogGlyph>;
    
    public logMessage(message: string) {
        this.messageQueue.push({
            Message: message,
            Timestamp: this.getTimestamp()
        })
    }

    public logGlyph(glyph: Glyph) {
        this.glyphQueue.push({
            Glyphs: glyph,
            Timestamp: this.getTimestamp()
        })
    }

    public flushMessages(): LogMessage[] {

    }

    public flushGlyphs(): LogGlyph[] {

    }

    
    private getTimestamp(): number {
        return new Date().getTime();
    }
}