import bcrypt from 'bcrypt';
import { Usuario } from '../domain/entities/Usuario';
import { AuthResult, IAuthService, LoginDTO, RegisterDTO } from '../domain/interfaces/services/IAuthService';
import { IUsuarioRepository } from '../domain/interfaces/repositories/IUsuarioRepository';
import { generateToken, verifyToken } from '../config/jwt';
import { BCRYPT_SALT_ROUNDS } from '../utils/constants';

export class AuthService implements IAuthService {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async login(credentials: LoginDTO): Promise<AuthResult> {
    const { login, senha } = credentials;

    // Buscar usuário pelo login
    const usuario = await this.usuarioRepository.findByLogin(login);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw new Error('Senha incorreta');
    }

    // Gerar token JWT
    const token = generateToken({ id: usuario.id!, login: usuario.login });

    // Retornar usuário (sem senha) e token
    const { senha: _, ...usuarioSemSenha } = usuario;
    return {
      usuario: usuarioSemSenha as Omit<Usuario, 'senha'>,
      token
    };
  }

  async register(userData: RegisterDTO): Promise<AuthResult> {
    const { nome, login, senha } = userData;

    // Verificar se o login já existe
    const usuarioExistente = await this.usuarioRepository.findByLogin(login);
    if (usuarioExistente) {
      throw new Error('Este login já está em uso');
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(senha, BCRYPT_SALT_ROUNDS);

    // Criar novo usuário
    const novoUsuario = await this.usuarioRepository.create({
      nome,
      login,
      senha: senhaCriptografada
    });

    // Gerar token JWT
    const token = generateToken({ id: novoUsuario.id!, login: novoUsuario.login });

    // Retornar usuário (sem senha) e token
    const { senha: _, ...usuarioSemSenha } = novoUsuario;
    return {
      usuario: usuarioSemSenha as Omit<Usuario, 'senha'>,
      token
    };
  }

  async validateToken(token: string): Promise<{ id: number; login: string } | null> {
    return verifyToken(token);
  }
}
