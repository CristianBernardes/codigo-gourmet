import { UsuarioRepository } from '../repositories/usuario.repository';
import { CategoriaRepository } from '../repositories/categoria.repository';
import { ReceitaRepository } from '../repositories/receita.repository';

import { AuthService } from '../services/auth.service';
import { CategoriaService } from '../services/categorias.service';
import { ReceitaService } from '../services/receitas.service';
import { UsuarioService } from '../services/usuario.service';

import { AuthController } from '../controllers/auth.controller';
import { CategoriasController } from '../controllers/categorias.controller';
import { ReceitasController } from '../controllers/receitas.controller';
import { UsuarioController } from '../controllers/usuario.controller';

import { createAuthRouter } from '../routes/auth.routes';
import { createCategoriasRouter } from '../routes/categorias.routes';
import { createReceitasRouter } from '../routes/receitas.routes';
import { createUsuariosRouter } from '../routes/usuarios.routes';

import { Router } from 'express';

/**
 * Dependency Injection Container
 * This class is responsible for creating and wiring together all the dependencies
 */
class Container {
  // Repositories
  private usuarioRepository: UsuarioRepository;
  private categoriaRepository: CategoriaRepository;
  private receitaRepository: ReceitaRepository;

  // Services
  private authService: AuthService;
  private categoriaService: CategoriaService;
  private receitaService: ReceitaService;
  private usuarioService: UsuarioService;

  // Controllers
  private authController: AuthController;
  private categoriasController: CategoriasController;
  private receitasController: ReceitasController;
  private usuarioController: UsuarioController;

  constructor() {
    // Initialize repositories
    this.usuarioRepository = new UsuarioRepository();
    this.categoriaRepository = new CategoriaRepository();
    this.receitaRepository = new ReceitaRepository();

    // Initialize services
    this.authService = new AuthService(this.usuarioRepository);
    this.categoriaService = new CategoriaService(this.categoriaRepository);
    this.receitaService = new ReceitaService(
      this.receitaRepository,
      this.categoriaRepository
    );
    this.usuarioService = new UsuarioService(this.usuarioRepository);

    // Initialize controllers
    this.authController = new AuthController(this.authService);
    this.categoriasController = new CategoriasController(this.categoriaService);
    this.receitasController = new ReceitasController(this.receitaService);
    this.usuarioController = new UsuarioController(this.usuarioService);
  }

  /**
   * Get the auth router
   */
  getAuthRouter(): Router {
    return createAuthRouter(this.authController);
  }

  /**
   * Get the categorias router
   */
  getCategoriasRouter(): Router {
    return createCategoriasRouter(this.categoriasController);
  }

  /**
   * Get the receitas router
   */
  getReceitasRouter(): Router {
    return createReceitasRouter(this.receitasController);
  }

  /**
   * Get the auth controller
   */
  getAuthController(): AuthController {
    return this.authController;
  }

  /**
   * Get the categorias controller
   */
  getCategoriasController(): CategoriasController {
    return this.categoriasController;
  }

  /**
   * Get the receitas controller
   */
  getReceitasController(): ReceitasController {
    return this.receitasController;
  }

  /**
   * Get the usuarios router
   */
  getUsuariosRouter(): Router {
    return createUsuariosRouter(this.usuarioController);
  }

  /**
   * Get the usuarios controller
   */
  getUsuarioController(): UsuarioController {
    return this.usuarioController;
  }
}

// Export a singleton instance of the container
export const container = new Container();
