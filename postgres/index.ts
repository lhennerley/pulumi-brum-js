import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

import { DockerPostgresArgs, GcpPostgresArgs, PostgresArgs } from "./types";

export abstract class Postgres extends pulumi.ComponentResource {
  public abstract readonly host: pulumi.Output<string>;

  public static create(
    name: string,
    args: PostgresArgs,
    opts?: pulumi.ComponentResourceOptions
  ): pulumi.ComponentResource {
    switch (args.type) {
      case "docker":
        return new DockerPostgres(name, args, opts);
      case "gcp":
        return new GcpPostgres(name, args, opts);
    }
  }

  constructor(
    type: string,
    name: string,
    args: PostgresArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super(type, name, args, opts);
  }
}

export class GcpPostgres extends Postgres {
  public readonly host: pulumi.Output<string>;

  constructor(
    name: string,
    args: GcpPostgresArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("brumjs:gcp:Postgres", name, args, opts);

    const config = new pulumi.Config();
    const dbPassword = config.requireSecret(`dbPassword`);

    // Location to deploy Cloud Run services
    const location = gcp.config.region || `us-central1`;

    // Create new postgres instance
    const pgInstance = new gcp.sql.DatabaseInstance(name, {
      region: location,
      databaseVersion: `POSTGRES_${args.version}`,
      settings: {
        // tier: 'db-g1-small',
        tier: `db-f1-micro`,
      },
      deletionProtection: true,
      rootPassword: dbPassword,
    });

    const database = new gcp.sql.Database(`brum-js`, {
      instance: pgInstance.name,
    });

    const user = new gcp.sql.User(`brum-js-user`, {
      instance: pgInstance.name,
      password: dbPassword,
    });

    this.host = pgInstance.name;
    // this.host = pulumi.interpolate`postgres://${user.name}:${dbPassword}@/${database.name}?host=/cloudsql/${pgInstance.connectionName}`;

    this.registerOutputs({
      host: this.host,
    });
  }
}

export class DockerPostgres extends Postgres {
  public readonly host: pulumi.Output<string>;

  constructor(
    name: string,
    args: DockerPostgresArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("brumjs:docker:Postgres", name, args, opts);
    const childOpts = { ...opts, parent: this };

    const config = new pulumi.Config();
    const dbPassword = config.requireSecret(`dbPassword`);

    const dockerImage = new docker.RemoteImage(
      `${name}-image`,
      {
        name: `postgres:${args.version}`,
        keepLocally: true,
      },
      childOpts
    );

    const dockerContainer = new docker.Container(
      `${name}-container`,
      {
        image: dockerImage.name,
        networksAdvanced: [{ name: args.network.name }],
        restart: "on-failure",
        ports: [
          {
            external: 5432,
            internal: 5432,
          },
        ],
        envs: [`POSTGRES_PASSWORD=${dbPassword}`],
      },
      childOpts
    );

    this.host = dockerContainer.name;
    this.registerOutputs({
      host: this.host,
    });
  }
}
