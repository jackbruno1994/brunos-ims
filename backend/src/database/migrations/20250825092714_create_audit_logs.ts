import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary();
    table.string('action').notNullable();
    table.string('entity_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('user_id').notNullable();
    table.jsonb('changes').notNullable();
    table.timestamp('timestamp').notNullable();
    table.index(['entity_type', 'entity_id']);
    table.index(['user_id']);
    table.index(['timestamp']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('audit_logs');
}