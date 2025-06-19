import {Model} from 'objection';

export class BaseModel extends Model {
    createdAt!: Date;
    updatedAt!: Date;

    $beforeInsert() {
        const now = new Date();
        this.createdAt = now;
        this.updatedAt = now;
    }

    $beforeUpdate() {
        this.updatedAt = new Date();
    }
}
