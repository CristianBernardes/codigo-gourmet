import { Usuario } from './Usuario';
import { Categoria } from './Categoria';

export interface Receita {
  id?: number;
  id_usuarios: number;
  id_categorias?: number;
  nome: string;
  tempo_preparo_minutos?: number;
  porcoes?: number;
  modo_preparo: string;
  ingredientes: string;
  criado_em?: Date;
  alterado_em?: Date;
  usuario?: Usuario;
  categoria?: Categoria;
}

export class ReceitaEntity implements Receita {
  id?: number;
  id_usuarios: number;
  id_categorias?: number;
  nome: string;
  tempo_preparo_minutos?: number;
  porcoes?: number;
  modo_preparo: string;
  ingredientes: string;
  criado_em?: Date;
  alterado_em?: Date;
  usuario?: Usuario;
  categoria?: Categoria;

  constructor(receita: Receita) {
    this.id = receita.id;
    this.id_usuarios = receita.id_usuarios;
    this.id_categorias = receita.id_categorias;
    this.nome = receita.nome;
    this.tempo_preparo_minutos = receita.tempo_preparo_minutos;
    this.porcoes = receita.porcoes;
    this.modo_preparo = receita.modo_preparo;
    this.ingredientes = receita.ingredientes;
    this.criado_em = receita.criado_em || new Date();
    this.alterado_em = receita.alterado_em || new Date();
    this.usuario = receita.usuario;
    this.categoria = receita.categoria;
  }
}