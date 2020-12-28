import { Dictionary, PlatformConfiguration, PlotConfig, ReporterData, RunningInstance } from "Model/Contracts";
import { AddressInfo } from "net";
import { MessageSender } from "Platform/MessageSender";
import { Platform } from "Platform/Platform";
import { PlatformInstance } from "Server/ServerContracts";
import * as uuid from "uuid/v4";
import * as WebSocket from "ws";

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
            websocketServer: null,
            connections: {}
        };

        return platformKey;
    }

    public getRunningInstances(): RunningInstance[] {
        return Object.keys(this.platformCollection).map<RunningInstance>((key) => {
            const platform = this.platformCollection[key].platform;
            return {
                key,
                exchange: platform.CurrentExchange,
                strategy: platform.CurrentStrategy,
                backtest: platform.IsBacktest
            };
        });
    }

    public getPlatformInstance(platformKey: string) {
        return this.platformCollection[platformKey];
    }

    public createSocketStream(platformKey: string): string | null {
        const instance = this.platformCollection[platformKey];
        let port = 0;

        if (instance) {
            const path = `/${instance.key}`;

            // Initialize websocket server if it doesn't already exist
            if (!instance.websocketServer) {
                port = this.getOpenPort();

                const websocket = instance.websocketServer = new WebSocket.Server({
                    host: "localhost",
                    path,
                    port: port
                });

                websocket.on("connection", (socket: WebSocket) => {
                    const key = uuid();

                    let plotConfigs: Dictionary<PlotConfig>;

                    if (!instance.platform.isRunning) {
                        plotConfigs = instance.platform.start();

                        this.reporterProtocol.SendReporterInit(plotConfigs, [socket]);
                    } else {
                        plotConfigs = instance.platform.PlotConfig!;

                        this.reporterProtocol.SendReporterInit(plotConfigs, [socket]);
                        this.reporterProtocol.SendReporterData(instance.platform.getData(500), [socket]);
                    }

                    instance.platform.subscribe((data: ReporterData) => {
                        this.updateData(data, instance.key);
                    }, null);

                    instance.connections[key] = socket;

                    socket.onclose = () => {
                        delete instance.connections[key];
                    };
                });
            } else {
                port = (instance.websocketServer.address() as AddressInfo).port;
            }

            return `ws://localhost:${port + path}`;
        } else {
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

    private updateData(data: Partial<ReporterData>, platformKey: string) {
        const sockets = Object.values(this.platformCollection[platformKey].connections);
        this.reporterProtocol.SendReporterData(data, sockets);
    }
}
