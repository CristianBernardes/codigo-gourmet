import { Receita } from '../../entities/Receita';

export interface ReceitaFiltros {
  id_usuarios?: number;
  id_categorias?: number;
  termo_busca?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IReceitaRepository {
  findById(id: number): Promise<Receita | null>;
  findByUsuario(id_usuarios: number, page?: number, pageSize?: number): Promise<PaginatedResult<Receita>>;
  findByCategoria(id_categorias: number, page?: number, pageSize?: number): Promise<PaginatedResult<Receita>>;
  search(filtros: ReceitaFiltros): Promise<PaginatedResult<Receita>>;
  create(receita: Receita): Promise<Receita>;
  update(id: number, receita: Partial<Receita>): Promise<Receita | null>;
  delete(id: number): Promise<boolean>;
  findAll(page?: number, pageSize?: number): Promise<PaginatedResult<Receita>>;
}
