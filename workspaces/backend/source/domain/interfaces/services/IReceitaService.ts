import { Receita } from '../../entities/Receita';
import { ReceitaFiltros, PaginatedResult } from '../repositories/IReceitaRepository';

export interface CreateReceitaDTO {
  id_usuarios: number;
  id_categorias?: number;
  nome: string;
  tempo_preparo_minutos?: number;
  porcoes?: number;
  modo_preparo: string;
  ingredientes: string;
}

export interface UpdateReceitaDTO {
  id_categorias?: number;
  nome?: string;
  tempo_preparo_minutos?: number;
  porcoes?: number;
  modo_preparo?: string;
  ingredientes?: string;
}

export interface IReceitaService {
  findById(id: number): Promise<Receita | null>;
  findByUsuario(id_usuarios: number, page?: number, pageSize?: number): Promise<PaginatedResult<Receita>>;
  findByCategoria(id_categorias: number, page?: number, pageSize?: number): Promise<PaginatedResult<Receita>>;
  search(filtros: ReceitaFiltros): Promise<PaginatedResult<Receita>>;
  findAll(page?: number, pageSize?: number): Promise<PaginatedResult<Receita>>;
  create(data: CreateReceitaDTO): Promise<Receita>;
  update(id: number, id_usuarios: number, data: UpdateReceitaDTO): Promise<Receita | null>;
  delete(id: number, id_usuarios: number): Promise<boolean>;
}
