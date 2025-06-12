import { Usuario } from '../../entities/Usuario';

export interface IUsuarioRepository {
  findById(id: number): Promise<Usuario | null>;
  findByLogin(login: string): Promise<Usuario | null>;
  create(usuario: Usuario): Promise<Usuario>;
  update(id: number, usuario: Partial<Usuario>): Promise<Usuario | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<Usuario[]>;
}