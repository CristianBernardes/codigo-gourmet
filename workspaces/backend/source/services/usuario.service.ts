import { IUsuarioService } from '../domain/interfaces/services/IUsuarioService';
import { IUsuarioRepository } from '../domain/interfaces/repositories/IUsuarioRepository';

export class UsuarioService implements IUsuarioService {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  /**
   * Get all users (only id and name)
   * @returns Promise with an array of user objects containing id and name
   */
  async getAllUsers(): Promise<{ id: number; nome: string }[]> {
    try {
      const usuarios = await this.usuarioRepository.findAll();
      return usuarios.map(usuario => ({
        id: usuario.id!,
        nome: usuario.nome
      }));
    } catch (error) {
      throw error;
    }
  }
}