import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

import { Postgres } from "./postgres";

const stack = pulumi.getStack();
const dbName = "pg-db";

let databaseUrl;

switch (stack) {
  case "local":
    const network = new docker.Network("net");
    // Create a Postgres database in local docker network
    databaseUrl = Postgres.create(dbName, {
      type: "docker",
      network: network,
      version: "13.5",
    });

    break;
  case "dev":
    databaseUrl = Postgres.create(dbName, {
      type: "gcp",
      version: "13",
    });
}

export const DATABASE_URL = databaseUrl;
