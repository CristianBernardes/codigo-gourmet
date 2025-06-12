import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('usuarios', (table) => {
    table.increments('id').primary();
    table.string('nome', 100).notNullable();
    table.string('login', 100).notNullable().unique();
    table.string('senha', 255).notNullable();
    table.datetime('criado_em').notNullable().defaultTo(knex.fn.now());
    table.datetime('alterado_em').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('login', 'idx_login');
    table.index('criado_em', 'idx_criado_em');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('usuarios');
}