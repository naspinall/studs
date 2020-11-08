import { Client, Pool } from "pg";
// import { QueryRunner } from "../queryRunner/queryRunner";
import { Primitive } from "../utility/types";

interface Connections {
  [index: string]: Connection;
}

const dummyClient = new Client();

const connections: Connections = {};

interface ConnectionConfiguration {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export const createConnection = (configuration: StudsConfiguration) => {
  const name = configuration?.name ? configuration.name : "default";

  if (configuration.replication)
    connections[name] = new ReplicaConnection(configuration);
  else connections[name] = new SingleConnection(configuration);
};

interface Connection {
  read(query: string, parameters: Array<Primitive>): Promise<Array<any>>;
  write(query: string, parameters: Array<Primitive>): Promise<Array<any>>;
}

class SingleConnection implements Connection {
  private pool!: Pool;

  constructor(configuration: StudsConfiguration) {
    this.pool = new Pool({
      host: configuration.host,
      port: configuration.port,
      user: configuration.user,
      password: configuration.password,
      database: configuration.database,
    });
  }

  async read(query: string, parameters: Array<Primitive>) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(query, parameters);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async write(query: string, parameters: Array<Primitive>) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(query, parameters);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}

class ReplicaConnection implements Connection {
  private readerPool!: Pool;
  private writerPool!: Pool;

  constructor(configuration: StudsConfiguration) {
    this.readerPool = new Pool(configuration?.replication?.reader);
    this.writerPool = new Pool(configuration?.replication?.writer);
  }

  async read(query: string, parameters: Array<Primitive>) {
    const client = await this.readerPool.connect();
    try {
      const { rows } = await client.query(query, parameters);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
  async write(query: string, parameters: Array<Primitive>) {
    const client = await this.writerPool.connect();
    try {
      const { rows } = await client.query(query, parameters);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}

interface StudsLogger {
  info(message: any): void;
}

interface StudsConfiguration extends ConnectionConfiguration {
  type: "postgres";
  name?: string;
  log?: boolean;
  logger?: StudsLogger;
  replication?: {
    writer: ConnectionConfiguration;
    // TODO add support for multiple read replicas
    reader: ConnectionConfiguration;
  };
}

export const getConnection = (connection?: string): Connection =>
  connection ? connections[connection] : connections["default"];

// const connectToDatabase = async () => await client.connect();
// const disconnectFromDatabase = async () => await client.end();

export const escapeIdentifier = (input: string) =>
  dummyClient.escapeIdentifier(input);

export const escapeLiteral = (input: string) =>
  dummyClient.escapeLiteral(input);
