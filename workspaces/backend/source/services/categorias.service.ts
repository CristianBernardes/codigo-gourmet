import { Categoria } from '../domain/entities/Categoria';
import { ICategoriaService, CreateCategoriaDTO, UpdateCategoriaDTO } from '../domain/interfaces/services/ICategoriaService';
import { ICategoriaRepository } from '../domain/interfaces/repositories/ICategoriaRepository';

export class CategoriaService implements ICategoriaService {
  constructor(private categoriaRepository: ICategoriaRepository) {}

  async findById(id: number): Promise<Categoria | null> {
    return this.categoriaRepository.findById(id);
  }

  async findAll(): Promise<Categoria[]> {
    return this.categoriaRepository.findAll();
  }

  async create(data: CreateCategoriaDTO): Promise<Categoria> {
    // Verificar se já existe uma categoria com o mesmo nome
    const categoriaExistente = await this.categoriaRepository.findByNome(data.nome);
    if (categoriaExistente) {
      throw new Error('Já existe uma categoria com este nome');
    }

    return this.categoriaRepository.create(data);
  }

  async update(id: number, data: UpdateCategoriaDTO): Promise<Categoria | null> {
    // Verificar se a categoria existe
    const categoriaExistente = await this.categoriaRepository.findById(id);
    if (!categoriaExistente) {
      throw new Error('Categoria não encontrada');
    }

    // Verificar se o novo nome já está em uso (se for diferente do atual)
    if (data.nome && data.nome !== categoriaExistente.nome) {
      const categoriaComMesmoNome = await this.categoriaRepository.findByNome(data.nome);
      if (categoriaComMesmoNome) {
        throw new Error('Já existe uma categoria com este nome');
      }
    }

    return this.categoriaRepository.update(id, data);
  }

  async delete(id: number): Promise<Categoria> {
    // Verificar se a categoria existe
    const categoriaExistente = await this.categoriaRepository.findById(id);
    if (!categoriaExistente) {
      throw new Error('Categoria não encontrada');
    }

    return this.categoriaRepository.delete(id);
  }
}
