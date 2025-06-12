import { Categoria } from '../../entities/Categoria';

export interface ICategoriaRepository {
  findById(id: number): Promise<Categoria | null>;
  findByNome(nome: string): Promise<Categoria | null>;
  create(categoria: Categoria): Promise<Categoria>;
  update(id: number, categoria: Partial<Categoria>): Promise<Categoria | null>;
  delete(id: number): Promise<Categoria>;
  findAll(): Promise<Categoria[]>;
}
