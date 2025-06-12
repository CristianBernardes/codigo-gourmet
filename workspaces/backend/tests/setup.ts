import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { Model } from 'objection';
import supertest from 'supertest';
import app from '../source/app';
import config from '../knexfile';

// Load environment variables from .env.test if it exists, otherwise use .env
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Force test environment
process.env.NODE_ENV = 'test';

// Initialize knex with the test configuration from knexfile.ts
const knexInstance = knex(config.test);

// Bind all Models to the knex instance
Model.knex(knexInstance);

// Create a supertest instance for making HTTP requests
export const request = supertest(app);

// Global afterAll hook to ensure all connections are closed
afterAll(async () => {
  try {
    // Close the test database connection
    if (knexInstance && typeof knexInstance.destroy === 'function') {
      await knexInstance.destroy();
    }

    // Close the main application database connection
    const { closeConnection } = require('../source/config/database');
    await closeConnection();

    // Reset the knex instance to ensure it's not reused
    if (Model && typeof Model.knex === 'function') {
      Model.knex(null as any);
    }

    // Add a small delay to allow any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Error in global afterAll hook:', error);
  }
});

/**
 * Setup function to run before tests
 * Runs migrations to create database schema
 */
export const setupTestDatabase = async (): Promise<void> => {
  try {
    // Only proceed if knexInstance is valid
    if (knexInstance && typeof knexInstance.migrate?.latest === 'function') {
      // Run migrations to create tables
      await knexInstance.migrate.latest();
    } else {
      console.error('Cannot run migrations: knexInstance or migrate.latest is not available');
    }
  } catch (error) {
    console.error('Error during database setup:', error);
    throw error; // Re-throw to fail the test if setup fails
  }
};

/**
 * Teardown function to run after tests
 * Rolls back migrations and cleans up the database
 */
export const teardownTestDatabase = async (): Promise<void> => {
  try {
    // Only proceed if knexInstance is valid
    if (knexInstance && typeof knexInstance.raw === 'function') {
      // Drop all tables to ensure a clean state
      await knexInstance.raw('PRAGMA foreign_keys = OFF');
      const tables = await knexInstance.raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");

      for (const table of tables) {
        await knexInstance.schema.dropTableIfExists(table.name);
      }

      // Roll back migrations
      if (typeof knexInstance.migrate?.rollback === 'function') {
        await knexInstance.migrate.rollback(undefined, true);
      }
    }
  } catch (error) {
    console.error('Error during database teardown:', error);
  }

  // Note: We don't close connections here as that's handled by the global afterAll hook
};

/**
 * Helper function to get an authentication token for testing protected routes
 * @param login User login
 * @param senha User password
 * @returns JWT token
 */
export const getAuthToken = async (login: string = 'teste@exemplo.com', senha: string = 'senha123'): Promise<string> => {
  const response = await request
    .post('/api/auth/login')
    .send({ login, senha });

  return response.body.data.token;
};

/**
 * Helper function to create a test user
 * @param userData User data (optional, uses defaults if not provided)
 * @returns Created user data
 */
export const createTestUser = async (userData?: { nome?: string; login?: string; senha?: string }): Promise<any> => {
  const defaultUserData = {
    nome: 'Usuário de Teste',
    login: `teste-${Date.now()}@exemplo.com`,
    senha: 'senha123',
    ...userData
  };

  const response = await request
    .post('/api/auth/register')
    .send(defaultUserData);

  return response.body.data;
};

/**
 * Helper function to create a test category
 * @param token Authentication token
 * @param nome Category name
 * @returns Created category data
 */
export const createTestCategory = async (token: string, nome: string = `Categoria de Teste ${Date.now()}`): Promise<any> => {
  const response = await request
    .post('/api/categorias')
    .set('Authorization', `Bearer ${token}`)
    .send({ nome });

  return response.body.data;
};

/**
 * Helper function to create a test recipe
 * @param token Authentication token
 * @param recipeData Recipe data (optional, uses defaults if not provided)
 * @returns Created recipe data
 */
export const createTestRecipe = async (
  token: string,
  recipeData?: {
    id_categorias?: number;
    nome?: string;
    tempo_preparo_minutos?: number;
    porcoes?: number;
    modo_preparo?: string;
    ingredientes?: string;
  }
): Promise<any> => {
  const defaultRecipeData = {
    nome: `Receita de Teste ${Date.now()}`,
    tempo_preparo_minutos: 30,
    porcoes: 4,
    modo_preparo: 'Modo de preparo de teste. Passo 1: Teste. Passo 2: Teste.',
    ingredientes: '- Ingrediente 1\n- Ingrediente 2\n- Ingrediente 3',
    ...recipeData
  };

  const response = await request
    .post('/api/receitas')
    .set('Authorization', `Bearer ${token}`)
    .send(defaultRecipeData);

  return response.body.data;
};

export { knexInstance as knex };
