import { Usuario, UsuarioEntity } from '../domain/entities/Usuario';
import { IUsuarioRepository } from '../domain/interfaces/repositories/IUsuarioRepository';
import db from '../config/database';
import { logger } from '../utils/logger';

export class UsuarioRepository implements IUsuarioRepository {
  private table = 'usuarios';

  async findById(id: number): Promise<Usuario | null> {
    try {
      const usuario = await db(this.table)
        .where({ id })
        .first();

      return usuario ? new UsuarioEntity(usuario) : null;
    } catch (error) {
      logger.error('Error in findById:', error);
      throw error;
    }
  }

  async findByLogin(login: string): Promise<Usuario | null> {
    try {
      const usuario = await db(this.table)
        .where({ login })
        .first();

      return usuario ? new UsuarioEntity(usuario) : null;
    } catch (error) {
      logger.error('Error in findByLogin:', error);
      throw error;
    }
  }

  async create(usuario: Usuario): Promise<Usuario> {
    try {
      const [id] = await db(this.table)
        .insert({
          nome: usuario.nome,
          login: usuario.login,
          senha: usuario.senha,
          criado_em: new Date(),
          alterado_em: new Date()
        });

      return new UsuarioEntity({ ...usuario, id });
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  }

  async update(id: number, usuario: Partial<Usuario>): Promise<Usuario | null> {
    try {
      const updateData = {
        ...usuario,
        alterado_em: new Date()
      };

      await db(this.table)
        .where({ id })
        .update(updateData);

      return this.findById(id);
    } catch (error) {
      logger.error('Error in update:', error);
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
      logger.error('Error in delete:', error);
      throw error;
    }
  }

  async findAll(): Promise<Usuario[]> {
    try {
      const usuarios = await db(this.table)
        .select('*');

      return usuarios.map(usuario => new UsuarioEntity(usuario));
    } catch (error) {
      logger.error('Error in findAll:', error);
      throw error;
    }
  }
}
