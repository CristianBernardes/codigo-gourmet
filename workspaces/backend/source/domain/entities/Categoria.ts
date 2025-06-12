export interface Categoria {
  id?: number;
  nome: string;
}

export class CategoriaEntity implements Categoria {
  id?: number;
  nome: string;

  constructor(categoria: Categoria) {
    this.id = categoria.id;
    this.nome = categoria.nome;
  }
}