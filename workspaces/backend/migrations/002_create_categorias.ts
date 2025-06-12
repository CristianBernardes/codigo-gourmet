import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('categorias', (table) => {
    table.increments('id').primary();
    table.string('nome', 100).notNullable().unique();

    // Indexes
    table.index('nome', 'idx_nome');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('categorias');
}