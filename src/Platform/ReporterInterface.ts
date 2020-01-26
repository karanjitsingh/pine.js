import { Queue } from "Model/Utils/Queue";
import { Glyph, LogGlyph, LogMessage } from "../Model/Contracts";

export interface ReporterLogs {
    MessageLogs: LogMessage[],
    GlyphLogs: LogGlyph[]
}

export class ReporterInterface {
    private messageQueue: Queue<LogMessage> = new Queue();;
    private glyphQueue: Queue<LogGlyph> = new Queue();

    private messageHistory: LogMessage[] = [];
    private glyphHistory: LogGlyph[] = [];

    public logMessage(message: string) {
        this.messageQueue.push({
            Message: message,
            Timestamp: this.getTimestamp()
        })
    }

    public logGlyph(glyph: Glyph, timestamp?: number) {
        this.glyphQueue.push({
            Glyphs: glyph,
            Timestamp: timestamp || this.getTimestamp()
        })
    }

    public flushMessages(): LogMessage[] {
        if(this.messageQueue.length) {
            const messages = this.messageQueue.flush();
            this.messageHistory = this.messageHistory.concat(messages);
            return messages;
        }
        return [];
    }

    public flushGlyphs(): LogGlyph[] {
        if(this.glyphQueue.length) {
            const glpyhs = this.glyphQueue.flush();
            this.glyphHistory = this.glyphHistory.concat(glpyhs);
            return glpyhs;
        }
        return [];
    }

    public getLogsSince(timestamp: number): ReporterLogs {
        let messageIndex = this.findClosest(this.messageHistory, timestamp);
        let glyphIndex = this.findClosest(this.glyphHistory, timestamp);

        if(messageIndex < this.messageHistory.length) {
            if (this.messageHistory[messageIndex].Timestamp < timestamp) {
                messageIndex += 1;
            }
        }

        if(glyphIndex < this.glyphHistory.length) {
            if (this.glyphHistory[glyphIndex].Timestamp < timestamp) {
                glyphIndex += 1;
            }
        }

        return {
            MessageLogs: this.messageHistory.slice(messageIndex),
            GlyphLogs: this.glyphHistory.slice(glyphIndex)
        };
    }

    private getTimestamp(): number {
        return new Date().getTime();
    }

    // Returns element closest to target in arr[] 
    private findClosest<T extends { Timestamp: number }>(arr: T[], target: number): number {
        const n = arr.length;

        if (n == 0) {
            return 0;
        }

        // Corner cases 
        if (target <= arr[0].Timestamp)
            return 0;
        if (target >= arr[n - 1].Timestamp)
            return n - 1;

        // Doing binary search 
        let i = 0, j = n, mid = 0;
        while (i < j) {
            mid = (i + j) / 2;

            if (arr[mid].Timestamp == target)
                return mid;

            /* If target is less than array element, 
                then search in left */
            if (target < arr[mid].Timestamp) {

                // If target is greater than previous 
                // to mid, return closest of two 
                if (mid > 0 && target > arr[mid - 1].Timestamp)
                    return arr[mid - 1].Timestamp < target ? mid : mid - 1;

                /* Repeat for left half */
                j = mid;
            }

            // If target is greater than mid 
            else {
                if (mid < n - 1 && target < arr[mid + 1].Timestamp)
                    return arr[mid].Timestamp < target ? mid + 1 : mid;
                // update i 
                i = mid + 1;
            }
        }

        // Only single element left after search 
        return mid;
    }
}