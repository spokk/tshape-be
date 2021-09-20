import { ProductServiceInterface, ProductInterface } from './products';
import { Client, QueryConfig } from 'pg';

class PostgresProductService implements ProductServiceInterface {

    private tableName = 'products';

    constructor(private databaseClient: Client) { }

    async getProductById(id: string): Promise<ProductInterface> {

        const query = {
            text: `SELECT * FROM ${this.tableName} WHERE id = $1`,
            values: [id],
        } as QueryConfig;

        const result = await this.databaseClient.query(query);
        return result.rows[0] ? result.rows[0] : null;
    }

    async getAllProducts(): Promise<ProductInterface[]> {
        const query = {
            text: `SELECT * FROM ${this.tableName}`,
        } as QueryConfig;

        const result = await this.databaseClient.query(query);
        return result.rows ? result.rows : null;
    }

    async create(product: Pick<ProductInterface, 'title' | 'description' | 'price' | 'count'>) {
        const { title, description, price, count } = JSON.parse(product as any)
        const result = await this.databaseClient.query('INSERT INTO products(title, description, price) VALUES($1, $2, $3) RETURNING *', [title, description, parseFloat(price)]);

        await this.databaseClient.query('INSERT INTO stocks(product_id, count) VALUES ($1, $2)', [
            result.rows[0].id,
            parseInt(count)
        ]);

        return result.rows[0] ? result.rows[0] : null;
    }
}

export { PostgresProductService };