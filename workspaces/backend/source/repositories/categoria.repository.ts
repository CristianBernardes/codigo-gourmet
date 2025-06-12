import { Categoria, CategoriaEntity } from '../domain/entities/Categoria';
import { ICategoriaRepository } from '../domain/interfaces/repositories/ICategoriaRepository';
import db from '../config/database';

export class CategoriaRepository implements ICategoriaRepository {
  private table = 'categorias';

  async findById(id: number): Promise<Categoria | null> {
    try {
      const categoria = await db(this.table)
        .where({ id })
        .first();

      return categoria ? new CategoriaEntity(categoria) : null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  async findByNome(nome: string): Promise<Categoria | null> {
    try {
      const categoria = await db(this.table)
        .where({ nome })
        .first();

      return categoria ? new CategoriaEntity(categoria) : null;
    } catch (error) {
      console.error('Error in findByNome:', error);
      throw error;
    }
  }

  async create(categoria: Categoria): Promise<Categoria> {
    try {
      const [id] = await db(this.table)
        .insert({
          nome: categoria.nome
        });

      return new CategoriaEntity({ ...categoria, id });
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async update(id: number, categoria: Partial<Categoria>): Promise<Categoria | null> {
    try {
      await db(this.table)
        .where({ id })
        .update(categoria);

      return this.findById(id);
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<Categoria> {
    try {
      // Get the category before deleting it
      const categoria = await this.findById(id);
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }

      // Delete the category
      await db(this.table)
        .where({ id })
        .delete();

      return categoria;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  async findAll(): Promise<Categoria[]> {
    try {
      const categorias = await db(this.table)
        .select('*');

      return categorias.map(categoria => new CategoriaEntity(categoria));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }
}
