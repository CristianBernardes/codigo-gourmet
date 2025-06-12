import { Receita, ReceitaEntity } from '../domain/entities/Receita';
import { IReceitaRepository, ReceitaFiltros, PaginatedResult } from '../domain/interfaces/repositories/IReceitaRepository';
import db from '../config/database';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../utils/constants';

export class ReceitaRepository implements IReceitaRepository {
  private table = 'receitas';

  async findById(id: number): Promise<Receita | null> {
    try {
      const receita = await db(this.table)
        .where(`${this.table}.id`, id)
        .join('usuarios', 'receitas.id_usuarios', 'usuarios.id')
        .leftJoin('categorias', 'receitas.id_categorias', 'categorias.id')
        .select(
          'receitas.*',
          'usuarios.nome as usuario_nome',
          'usuarios.login as usuario_login',
          'categorias.nome as categoria_nome'
        )
        .first();

      if (!receita) return null;

      return new ReceitaEntity({
        ...receita,
        usuario: receita.usuario_nome ? {
          id: receita.id_usuarios,
          nome: receita.usuario_nome,
          login: receita.usuario_login,
          senha: '' // Não retornamos a senha
        } : undefined,
        categoria: receita.categoria_nome ? {
          id: receita.id_categorias,
          nome: receita.categoria_nome
        } : undefined
      });
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  async findByUsuario(id_usuarios: number, page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE): Promise<PaginatedResult<Receita>> {
    try {
      // Ensure pageSize doesn't exceed the maximum
      const limitSize = Math.min(pageSize, MAX_PAGE_SIZE);
      const offset = (page - 1) * limitSize;

      // Get total count
      const [{ count }] = await db(this.table)
        .where({ id_usuarios })
        .count({ count: '*' });

      // Get paginated data
      const receitas = await db(this.table)
        .where({ id_usuarios })
        .leftJoin('categorias', 'receitas.id_categorias', 'categorias.id')
        .select(
          'receitas.*',
          'categorias.nome as categoria_nome'
        )
        .limit(limitSize)
        .offset(offset);

      const data = receitas.map(receita => new ReceitaEntity({
        ...receita,
        categoria: receita.categoria_nome ? {
          id: receita.id_categorias,
          nome: receita.categoria_nome
        } : undefined
      }));

      const totalItems = Number(count);
      const totalPages = Math.ceil(totalItems / limitSize);

      return {
        data,
        totalItems,
        page,
        pageSize: limitSize,
        totalPages
      };
    } catch (error) {
      console.error('Error in findByUsuario:', error);
      throw error;
    }
  }

  async findByCategoria(id_categorias: number, page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE): Promise<PaginatedResult<Receita>> {
    try {
      // Ensure pageSize doesn't exceed the maximum
      const limitSize = Math.min(pageSize, MAX_PAGE_SIZE);
      const offset = (page - 1) * limitSize;

      // Get total count
      const [{ count }] = await db(this.table)
        .where({ id_categorias })
        .count({ count: '*' });

      // Get paginated data
      const receitas = await db(this.table)
        .where({ id_categorias })
        .join('usuarios', 'receitas.id_usuarios', 'usuarios.id')
        .select(
          'receitas.*',
          'usuarios.nome as usuario_nome',
          'usuarios.login as usuario_login'
        )
        .limit(limitSize)
        .offset(offset);

      const data = receitas.map(receita => new ReceitaEntity({
        ...receita,
        usuario: {
          id: receita.id_usuarios,
          nome: receita.usuario_nome,
          login: receita.usuario_login,
          senha: '' // Não retornamos a senha
        }
      }));

      const totalItems = Number(count);
      const totalPages = Math.ceil(totalItems / limitSize);

      return {
        data,
        totalItems,
        page,
        pageSize: limitSize,
        totalPages
      };
    } catch (error) {
      console.error('Error in findByCategoria:', error);
      throw error;
    }
  }

  async search(filtros: ReceitaFiltros): Promise<PaginatedResult<Receita>> {
    try {
      const page = filtros.page || 1;
      const pageSize = filtros.pageSize || DEFAULT_PAGE_SIZE;

      // Ensure pageSize doesn't exceed the maximum
      const limitSize = Math.min(pageSize, MAX_PAGE_SIZE);
      const offset = (page - 1) * limitSize;

      // Build base query
      let baseQuery = db(this.table)
        .join('usuarios', 'receitas.id_usuarios', 'usuarios.id')
        .leftJoin('categorias', 'receitas.id_categorias', 'categorias.id');

      if (filtros.id_usuarios) {
        baseQuery = baseQuery.where('receitas.id_usuarios', filtros.id_usuarios);
      }

      if (filtros.id_categorias) {
        baseQuery = baseQuery.where('receitas.id_categorias', filtros.id_categorias);
      }

      if (filtros.termo_busca) {
        baseQuery = baseQuery.whereRaw(
          'MATCH(receitas.nome, receitas.ingredientes, receitas.modo_preparo) AGAINST(? IN BOOLEAN MODE)',
          [`*${filtros.termo_busca}*`]
        );
      }

      // Get total count
      const [{ count }] = await baseQuery.clone().count({ count: '*' });

      // Get paginated data
      const receitas = await baseQuery
        .select(
          'receitas.*',
          'usuarios.nome as usuario_nome',
          'usuarios.login as usuario_login',
          'categorias.nome as categoria_nome'
        )
        .limit(limitSize)
        .offset(offset);

      const data = receitas.map(receita => new ReceitaEntity({
        ...receita,
        usuario: {
          id: receita.id_usuarios,
          nome: receita.usuario_nome,
          login: receita.usuario_login,
          senha: '' // Não retornamos a senha
        },
        categoria: receita.categoria_nome ? {
          id: receita.id_categorias,
          nome: receita.categoria_nome
        } : undefined
      }));

      const totalItems = Number(count);
      const totalPages = Math.ceil(totalItems / limitSize);

      return {
        data,
        totalItems,
        page,
        pageSize: limitSize,
        totalPages
      };
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  async create(receita: Receita): Promise<Receita> {
    try {
      const [id] = await db(this.table)
        .insert({
          id_usuarios: receita.id_usuarios,
          id_categorias: receita.id_categorias,
          nome: receita.nome,
          tempo_preparo_minutos: receita.tempo_preparo_minutos,
          porcoes: receita.porcoes,
          modo_preparo: receita.modo_preparo,
          ingredientes: receita.ingredientes,
          criado_em: new Date(),
          alterado_em: new Date()
        });

      return this.findById(id) as Promise<Receita>;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async update(id: number, receita: Partial<Receita>): Promise<Receita | null> {
    try {
      const updateData = {
        ...receita,
        alterado_em: new Date()
      };

      // Remove related entities from update data
      delete updateData.usuario;
      delete updateData.categoria;

      await db(this.table)
        .where({ id })
        .update(updateData);

      return this.findById(id);
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await db(this.table)
        .where({ id })
        .delete();

      return result > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  async findAll(page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE): Promise<PaginatedResult<Receita>> {
    try {
      // Ensure pageSize doesn't exceed the maximum
      const limitSize = Math.min(pageSize, MAX_PAGE_SIZE);
      const offset = (page - 1) * limitSize;

      // Get total count
      const [{ count }] = await db(this.table)
        .count({ count: '*' });

      // Get paginated data
      const receitas = await db(this.table)
        .join('usuarios', 'receitas.id_usuarios', 'usuarios.id')
        .leftJoin('categorias', 'receitas.id_categorias', 'categorias.id')
        .select(
          'receitas.*',
          'usuarios.nome as usuario_nome',
          'usuarios.login as usuario_login',
          'categorias.nome as categoria_nome'
        )
        .limit(limitSize)
        .offset(offset);

      const data = receitas.map(receita => new ReceitaEntity({
        ...receita,
        usuario: {
          id: receita.id_usuarios,
          nome: receita.usuario_nome,
          login: receita.usuario_login,
          senha: '' // Não retornamos a senha
        },
        categoria: receita.categoria_nome ? {
          id: receita.id_categorias,
          nome: receita.categoria_nome
        } : undefined
      }));

      const totalItems = Number(count);
      const totalPages = Math.ceil(totalItems / limitSize);

      return {
        data,
        totalItems,
        page,
        pageSize: limitSize,
        totalPages
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }
}
