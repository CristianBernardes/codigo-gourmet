"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // First create the table with standard columns and indexes
        yield knex.schema.createTable('receitas', (table) => {
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
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.dropTable('receitas');
    });
}
