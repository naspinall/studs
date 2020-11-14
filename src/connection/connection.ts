import { Client, Pool } from "pg";
import { Primitive } from "../utility/types";
import { StudsDefaultLogger, StudsLogger } from "./logger";

const isSelect = /^select/gim;

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
  read(query: string, parameters?: Array<Primitive>): Promise<Array<any>>;
  write(query: string, parameters?: Array<Primitive>): Promise<Array<any>>;
  writeTransaction(
    query: string,
    parameters?: Array<Primitive>
  ): Promise<Array<any>>;
  query(query: string, parameters?: Array<Primitive>): Promise<Array<any>>;
  disconnect(): Promise<void>;
}

class SingleConnection implements Connection {
  private pool!: Pool;
  private logger?: StudsLogger;

  constructor(configuration: StudsConfiguration) {
    this.pool = new Pool({
      host: configuration.host,
      port: configuration.port,
      user: configuration.user,
      password: configuration.password,
      database: configuration.database,
    });

    if (configuration.log)
      this.logger = configuration.logger || new StudsDefaultLogger();
  }

  async read(query: string, parameters?: Array<Primitive>) {
    const client = await this.pool.connect();
    try {
      this?.logger?.logQuery(query, parameters);
      const { rows } = await client.query(query, parameters);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async write(query: string, parameters?: Array<Primitive>) {
    const client = await this.pool.connect();
    try {
      this?.logger?.logQuery(query, parameters);
      const { rows } = await client.query(query, parameters);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async writeTransaction(query: string, parameters?: Array<Primitive>) {
    const client = await this.pool.connect();
    try {
      this?.logger?.logQuery(query, parameters);
      await client.query("BEGIN");
      const { rows } = await client.query(query, parameters);
      await client.query("COMMIT");
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async query(query: string, parameters?: Array<Primitive>) {
    return await this.read(query, parameters);
  }

  async disconnect() {
    await this.pool.end();
  }
}

class ReplicaConnection implements Connection {
  private readerPool!: Pool;
  private writerPool!: Pool;
  private logger?: StudsLogger;

  constructor(configuration: StudsConfiguration) {
    this.readerPool = new Pool(configuration?.replication?.reader);
    this.writerPool = new Pool(configuration?.replication?.writer);
    this.logger = configuration.logger || new StudsDefaultLogger();
  }

  async read(query: string, parameters?: Array<Primitive>) {
    const client = await this.readerPool.connect();
    try {
      this?.logger?.logQuery(query, parameters || []);
      const { rows } = await client.query(query, parameters);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async write(query: string, parameters?: Array<Primitive>) {
    const client = await this.writerPool.connect();
    try {
      this?.logger?.logQuery(query, parameters || []);
      const { rows } = await client.query(query, parameters);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async writeTransaction(query: string, parameters?: Array<Primitive>) {
    const client = await this.writerPool.connect();
    try {
      this?.logger?.logQuery(query, parameters || []);
      await client.query("BEGIN");
      const { rows } = await client.query(query, parameters);
      await client.query("COMMIT");
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async query(query: string, parameters?: Array<Primitive>) {
    const toReader = isSelect.test(query);
    if (toReader) return this.read(query, parameters);
    return this.write(query, parameters);
  }

  async disconnect() {
    await Promise.all([this.writerPool.end(), this.readerPool.end()]);
  }
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

export const escapeIdentifier = (input: string) =>
  dummyClient.escapeIdentifier(input);

export const escapeLiteral = (input: string) =>
  dummyClient.escapeLiteral(input);
