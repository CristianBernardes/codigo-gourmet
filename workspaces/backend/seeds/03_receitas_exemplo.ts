import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('receitas').del();

  // Inserts seed entries
  const receitas = [
    {
      id: 1,
      id_usuarios: 1,
      id_categorias: 2, // Carnes
      nome: 'Bife à Parmegiana',
      tempo_preparo_minutos: 45,
      porcoes: 4,
      ingredientes: `
        - 4 bifes de contra filé
        - 2 ovos batidos
        - 2 xícaras de farinha de rosca
        - 1 xícara de queijo parmesão ralado
        - 2 xícaras de molho de tomate
        - 200g de queijo muçarela fatiado
        - Sal e pimenta a gosto
        - Óleo para fritar
      `,
      modo_preparo: `
        1. Tempere os bifes com sal e pimenta.
        2. Passe os bifes nos ovos batidos e depois na farinha de rosca misturada com metade do queijo parmesão.
        3. Aqueça o óleo em uma frigideira e frite os bifes até dourar dos dois lados.
        4. Em um refratário, coloque uma camada de molho de tomate, os bifes fritos, mais molho por cima.
        5. Cubra com as fatias de muçarela e polvilhe o restante do queijo parmesão.
        6. Leve ao forno preaquecido a 180°C por cerca de 15 minutos ou até o queijo derreter e dourar.
        7. Sirva quente, acompanhado de arroz branco e batatas fritas.
      `,
      criado_em: new Date(),
      alterado_em: new Date()
    },
    {
      id: 2,
      id_usuarios: 1,
      id_categorias: 9, // Doces e sobremesas
      nome: 'Pudim de Leite Condensado',
      tempo_preparo_minutos: 60,
      porcoes: 8,
      ingredientes: `
        - 1 lata de leite condensado
        - 2 latas de leite (use a lata de leite condensado vazia como medida)
        - 3 ovos inteiros
        - 1 xícara de açúcar para a calda
        - 1/4 xícara de água para a calda
      `,
      modo_preparo: `
        1. Primeiro, faça a calda: derreta o açúcar em uma panela até ficar dourado.
        2. Adicione a água com cuidado (vai espirrar) e mexa até dissolver todo o açúcar.
        3. Despeje a calda em uma forma de pudim e reserve.
        4. No liquidificador, bata o leite condensado, o leite e os ovos até ficar homogêneo.
        5. Despeje a mistura na forma caramelizada.
        6. Cubra a forma com papel alumínio.
        7. Leve ao forno em banho-maria por cerca de 1 hora a 180°C.
        8. Depois de assado, deixe esfriar e leve à geladeira por pelo menos 2 horas.
        9. Desenforme e sirva gelado.
      `,
      criado_em: new Date(),
      alterado_em: new Date()
    },
    {
      id: 3,
      id_usuarios: 2,
      id_categorias: 13, // Alimentação Saudável
      nome: 'Salada de Quinoa com Legumes',
      tempo_preparo_minutos: 30,
      porcoes: 4,
      ingredientes: `
        - 1 xícara de quinoa
        - 2 xícaras de água
        - 1 pimentão vermelho picado
        - 1 pepino picado
        - 1 cenoura ralada
        - 1/2 cebola roxa picada
        - 1/4 xícara de salsinha picada
        - Suco de 1 limão
        - 3 colheres de sopa de azeite de oliva
        - Sal e pimenta a gosto
      `,
      modo_preparo: `
        1. Lave bem a quinoa em água corrente.
        2. Em uma panela, coloque a quinoa e a água, leve ao fogo alto.
        3. Quando ferver, reduza o fogo, tampe e cozinhe por cerca de 15 minutos ou até a água secar.
        4. Desligue o fogo e deixe a quinoa esfriar completamente.
        5. Em uma tigela grande, misture a quinoa já fria com o pimentão, pepino, cenoura e cebola.
        6. Adicione a salsinha, o suco de limão, o azeite, sal e pimenta.
        7. Misture bem e sirva em seguida ou refrigere antes de servir.
      `,
      criado_em: new Date(),
      alterado_em: new Date()
    }
  ];

  await knex('receitas').insert(receitas);
}