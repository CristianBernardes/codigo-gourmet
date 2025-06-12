import { Categoria } from '../../entities/Categoria';

export interface CreateCategoriaDTO {
  nome: string;
}

export interface UpdateCategoriaDTO {
  nome: string;
}

export interface ICategoriaService {
  findById(id: number): Promise<Categoria | null>;
  findAll(): Promise<Categoria[]>;
  create(data: CreateCategoriaDTO): Promise<Categoria>;
  update(id: number, data: UpdateCategoriaDTO): Promise<Categoria | null>;
  delete(id: number): Promise<Categoria>;
}
