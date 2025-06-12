import { Receita } from '../domain/entities/Receita';
import { IReceitaService, CreateReceitaDTO, UpdateReceitaDTO } from '../domain/interfaces/services/IReceitaService';
import { IReceitaRepository, ReceitaFiltros, PaginatedResult } from '../domain/interfaces/repositories/IReceitaRepository';
import { ICategoriaRepository } from '../domain/interfaces/repositories/ICategoriaRepository';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../utils/constants';

export class ReceitaService implements IReceitaService {
  constructor(
    private receitaRepository: IReceitaRepository,
    private categoriaRepository: ICategoriaRepository
  ) {}

  async findById(id: number): Promise<Receita | null> {
    return this.receitaRepository.findById(id);
  }

  async findByUsuario(id_usuarios: number, page?: number, pageSize?: number): Promise<PaginatedResult<Receita>> {
    return this.receitaRepository.findByUsuario(id_usuarios, page, pageSize);
  }

  async findByCategoria(id_categorias: number, page?: number, pageSize?: number): Promise<PaginatedResult<Receita>> {
    // Verificar se a categoria existe
    const categoriaExistente = await this.categoriaRepository.findById(id_categorias);
    if (!categoriaExistente) {
      throw new Error('Categoria não encontrada');
    }

    return this.receitaRepository.findByCategoria(id_categorias, page, pageSize);
  }

  async search(filtros: ReceitaFiltros): Promise<PaginatedResult<Receita>> {
    // Verificar se a categoria existe, se fornecida
    if (filtros.id_categorias) {
      const categoriaExistente = await this.categoriaRepository.findById(filtros.id_categorias);
      if (!categoriaExistente) {
        throw new Error('Categoria não encontrada');
      }
    }

    return this.receitaRepository.search(filtros);
  }

  async findAll(page?: number, pageSize?: number): Promise<PaginatedResult<Receita>> {
    return this.receitaRepository.findAll(page, pageSize);
  }

  async create(data: CreateReceitaDTO): Promise<Receita> {
    // Verificar se a categoria existe, se fornecida
    if (data.id_categorias) {
      const categoriaExistente = await this.categoriaRepository.findById(data.id_categorias);
      if (!categoriaExistente) {
        throw new Error('Categoria não encontrada');
      }
    }

    return this.receitaRepository.create(data);
  }

  async update(id: number, id_usuarios: number, data: UpdateReceitaDTO): Promise<Receita | null> {
    // Verificar se a receita existe
    const receitaExistente = await this.receitaRepository.findById(id);
    if (!receitaExistente) {
      throw new Error('Receita não encontrada');
    }

    // Verificar se a receita pertence ao usuário
    if (receitaExistente.id_usuarios !== id_usuarios) {
      throw new Error('Você não tem permissão para editar esta receita');
    }

    // Verificar se a categoria existe, se fornecida
    if (data.id_categorias) {
      const categoriaExistente = await this.categoriaRepository.findById(data.id_categorias);
      if (!categoriaExistente) {
        throw new Error('Categoria não encontrada');
      }
    }

    return this.receitaRepository.update(id, data);
  }

  async delete(id: number, id_usuarios: number): Promise<boolean> {
    // Verificar se a receita existe
    const receitaExistente = await this.receitaRepository.findById(id);
    if (!receitaExistente) {
      throw new Error('Receita não encontrada');
    }

    // Verificar se a receita pertence ao usuário
    if (receitaExistente.id_usuarios !== id_usuarios) {
      throw new Error('Você não tem permissão para excluir esta receita');
    }

    return this.receitaRepository.delete(id);
  }
}
