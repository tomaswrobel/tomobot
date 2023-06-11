import {createConnection} from "mysql";

const connection = createConnection({
	host: "db-eu-02.sparkedhost.us",
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DATABASE,
});

connection.connect();

class Database {
	table: string;

	constructor(serverId: string) {
		this.table = `server_${serverId}`;
	}

	public createTable() {
		return new Promise<void>((resolve, reject) => {
			const query = `CREATE TABLE IF NOT EXISTS ${this.table} (user VARCHAR(255), points INT)`;
			connection.query(query, error => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

	public has(user: string) {
		return new Promise<boolean>((resolve, reject) => {
			const query = `SELECT * FROM ${this.table} WHERE user = '${user}'`;
			connection.query(query, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results.length > 0);
				}
			});
		});
	}

	private setPoints(user: string, points: number) {
		return new Promise<void>((resolve, reject) => {
			const query = `INSERT INTO ${this.table} (user, points) VALUES ('${user}', ${points})`;
			connection.query(query, error => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

	public get(user: string) {
		return new Promise<number>((resolve, reject) => {
			const query = `SELECT points FROM ${this.table} WHERE user = '${user}'`;
			connection.query(query, (error, [result]) => {
				if (error) {
					reject(error);
				} else {
					resolve(result ? result.points : 0);
				}
			});
		});
	}

	private addPoints(user: string, points: number) {
		return new Promise<void>((resolve, reject) => {
			const query = `UPDATE ${this.table} SET points = points + ${points} WHERE user = '${user}'`;
			connection.query(query, error => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

    public async add(user: string, points: number) {
        if (await this.has(user)) {
            await this.addPoints(user, points);
        } else {
            await this.setPoints(user, points);
        }
    }

    public remove(user: string) {
        return new Promise<void>((resolve, reject) => {
            const query = `DELETE FROM ${this.table} WHERE user = '${user}'`;
            connection.query(query, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

export default Database;