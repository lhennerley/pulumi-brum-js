import * as docker from "@pulumi/docker";

export interface GcpPostgresArgs {
  type: "gcp";
  version: string;
}
export interface DockerPostgresArgs {
  type: "docker";
  version: string;
  network: docker.Network;
}

export type PostgresArgs = DockerPostgresArgs | GcpPostgresArgs;
