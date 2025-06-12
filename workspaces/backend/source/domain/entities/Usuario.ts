export interface Usuario {
  id?: number;
  nome: string;
  login: string;
  senha: string;
  criado_em?: Date;
  alterado_em?: Date;
}

export class UsuarioEntity implements Usuario {
  id?: number;
  nome: string;
  login: string;
  senha: string;
  criado_em?: Date;
  alterado_em?: Date;

  constructor(usuario: Usuario) {
    this.id = usuario.id;
    this.nome = usuario.nome;
    this.login = usuario.login;
    this.senha = usuario.senha;
    this.criado_em = usuario.criado_em || new Date();
    this.alterado_em = usuario.alterado_em || new Date();
  }
}