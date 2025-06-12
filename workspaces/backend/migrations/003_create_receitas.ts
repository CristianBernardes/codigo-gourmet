import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First create the table with standard columns and indexes
  await knex.schema.createTable('receitas', (table) => {
    table.increments('id').primary();
    table.integer('id_usuarios').unsigned().notNullable();
    table.integer('id_categorias').unsigned().nullable();
    table.string('nome', 255).notNullable();
    table.integer('tempo_preparo_minutos').unsigned().nullable();
    table.integer('porcoes').unsigned().nullable();
    table.text('modo_preparo').notNullable();
    table.text('ingredientes').notNullable();
    table.datetime('criado_em').notNullable().defaultTo(knex.fn.now());
    table.datetime('alterado_em').notNullable().defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('id_usuarios').references('id').inTable('usuarios').onDelete('CASCADE');
    table.foreign('id_categorias').references('id').inTable('categorias').onDelete('SET NULL');

    // Indexes
    table.index('id_usuarios', 'idx_usuario');
    table.index('id_categorias', 'idx_categoria');
    table.index('nome', 'idx_nome');
    table.index('criado_em', 'idx_criado_em');
  });

  // Then add the FULLTEXT index in a separate step
  // Note: This is MySQL specific syntax
  return knex.raw('ALTER TABLE `receitas` ADD FULLTEXT INDEX `idx_busca` (`nome`, `ingredientes`, `modo_preparo`)');
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('receitas');
}
