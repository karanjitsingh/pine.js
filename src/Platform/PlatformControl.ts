import { PlatformConfiguration, ReporterData, Dictionary } from "Model/Contracts";
import { MessageSender } from "Platform/MessageSender";
import { Platform } from "Platform/Platform";
import { PlatformInstance } from "Server/ServerContracts";
import * as uuid from 'uuid/v4';
import * as WebSocket from 'ws';
import * as net from 'net';

export class PlatformControl {
    private platformCollection: Dictionary<PlatformInstance> = {};
    private reporterProtocol: MessageSender;

    public constructor() {
        this.reporterProtocol = new MessageSender();
    }

    public addPlatform(config: PlatformConfiguration) {
        const platformKey = uuid();
        const platform = new Platform(config);

        this.platformCollection[platformKey] = {
            key: platformKey,
            platform,
            server: null,
            connections: {}
        };

        return platformKey;
    }

    public getInstance(platformKey: string) {
        return this.platformCollection[platformKey];
    }

    public createSocketStream(platformKey: string): string {
        const instance = this.platformCollection[platformKey];

        if (instance) {
            const port: number = this.getOpenPort();
            const address = `ws://localhost:${port}`;
            const path = `/${instance.key}`;

            if (!instance.server) {
                const websocket = instance.server = new WebSocket.Server({
                    host: 'localhost',
                    path,
                    port: port
                });

                websocket.on('connection', (socket: WebSocket) => {
                    const key = uuid();

                    if (!instance.platform.isRunning) {

                        instance.platform.subscribe((data: ReporterData) => {
                            this.updateData(data, instance.key);
                        }, null);

                        const plotConfigs = instance.platform.start();

                        this.reporterProtocol.SendReporterInit(plotConfigs, [socket]);
                    }

                    instance.connections[key] = socket;

                    socket.onclose = () => {
                        delete instance.connections[key];
                    }
                });
            }

            return address + path;
        }
        else {
            return null;
        }
    }

    private getOpenPort(): number {

        // const getPortPromise = (retryCount: number) => {
        //     return new Promise<number>((resolve, reject) => {

        //         var server = net.createServer()
        //         server.listen(0)
        //         server.listen(0, () => {
        //             var port = 3;
        //             server.once('close', () => {
        //                 resolve(port);
        //             })
        //             server.close()
        //         })
        //         server.on('error', () => {
        //             if(retryCount == 2) {
        //                 reject("No open port in 3 retries")
        //             }
        //             getPortPromise(retryCount + 1 as any);
        //         })
        //     })
        // }

        // return getPortPromise(0);

        return this.random(1024, 49151);
    }

    private random(start: number, end: number) {
        return Math.floor(Math.random() * (end - start + 1)) + start;
    }

    private updateData(data: ReporterData, platformKey: string) {
        const sockets = Object.values(this.platformCollection[platformKey].connections);
        this.reporterProtocol.SendReporterData(data, sockets);
    }
}
