import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('categorias').del();

  // Inserts seed entries
  await knex('categorias').insert([
    { id: 1, nome: 'Bolos e tortas doces' },
    { id: 2, nome: 'Carnes' },
    { id: 3, nome: 'Aves' },
    { id: 4, nome: 'Peixes e frutos do mar' },
    { id: 5, nome: 'Saladas, molhos e acompanhamentos' },
    { id: 6, nome: 'Sopas' },
    { id: 7, nome: 'Massas' },
    { id: 8, nome: 'Bebidas' },
    { id: 9, nome: 'Doces e sobremesas' },
    { id: 10, nome: 'Lanches' },
    { id: 11, nome: 'Prato Único' },
    { id: 12, nome: 'Light' },
    { id: 13, nome: 'Alimentação Saudável' },
    { id: 14, nome: 'Vegetariano' },
    { id: 15, nome: 'Vegano' }
  ]);
}