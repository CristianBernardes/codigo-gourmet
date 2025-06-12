import { Usuario } from '../../entities/Usuario';

export interface LoginDTO {
  login: string;
  senha: string;
}

export interface RegisterDTO {
  nome: string;
  login: string;
  senha: string;
}

export interface AuthResult {
  usuario: Omit<Usuario, 'senha'>;
  token: string;
}

export interface IAuthService {
  login(credentials: LoginDTO): Promise<AuthResult>;
  register(userData: RegisterDTO): Promise<AuthResult>;
  validateToken(token: string): Promise<{ id: number; login: string } | null>;
}