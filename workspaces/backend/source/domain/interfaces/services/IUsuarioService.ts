import { Usuario } from '../../entities/Usuario';

export interface IUsuarioService {
  /**
   * Get all users (only id and name)
   * @returns Promise with an array of user objects containing id and name
   */
  getAllUsers(): Promise<{ id: number; nome: string }[]>;
}