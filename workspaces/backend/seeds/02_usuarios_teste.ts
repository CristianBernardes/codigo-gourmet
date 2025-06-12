import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('usuarios').del();

  // Hash passwords
  const senha1 = await bcrypt.hash('senha123', 10);
  const senha2 = await bcrypt.hash('teste456', 10);

  // Inserts seed entries
  await knex('usuarios').insert([
    { 
      id: 1, 
      nome: 'Usuário de Teste', 
      login: 'teste@exemplo.com', 
      senha: senha1,
      criado_em: new Date(),
      alterado_em: new Date()
    },
    { 
      id: 2, 
      nome: 'Administrador', 
      login: 'admin@exemplo.com', 
      senha: senha2,
      criado_em: new Date(),
      alterado_em: new Date()
    }
  ]);
}