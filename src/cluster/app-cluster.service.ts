import { Logger } from '@nestjs/common';
import cluster = require('cluster');
import * as os from 'os';
import { Injectable } from '@nestjs/common';

const numCPUs = os.cpus().length;

@Injectable()
export class AppClusterService {
    private static readonly logger = new Logger(AppClusterService.name);

    static clusterize(callback: () => any): void {
        if (cluster.isPrimary) {
            AppClusterService.logger.debug(
                `Master server started on ${process.pid}`,
            );
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }
            cluster.on('exit', (worker, code, signal) => {
                AppClusterService.logger.debug(
                    `Worker ${worker.process.pid} died. Restarting`,
                );

                cluster.fork();
            });
        } else {
            AppClusterService.logger.debug(
                console.log(`Cluster server started on ${process.pid}`),
            );

            callback();
        }
    }
}
