import {Model} from 'objection';

export class BaseModel extends Model {
    createdAt!: string;
    updatedAt!: string;

    $beforeInsert() {
        const now = new Date().toISOString();
        this.createdAt = now;
        this.updatedAt = now;
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }
}
