"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const bcrypt_1 = __importDefault(require("bcrypt"));
function seed(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Deletes ALL existing entries
        yield knex('usuarios').del();
        // Hash passwords
        const senha1 = yield bcrypt_1.default.hash('senha123', 10);
        const senha2 = yield bcrypt_1.default.hash('teste456', 10);
        // Inserts seed entries
        yield knex('usuarios').insert([
            {
                id: 1,
                nome: 'Usuário de Teste',
                login: 'teste@exemplo.com',
                senha: senha1,
                criado_em: new Date(),
                alterado_em: new Date()
            },
            {
                id: 2,
                nome: 'Administrador',
                login: 'admin@exemplo.com',
                senha: senha2,
                criado_em: new Date(),
                alterado_em: new Date()
            }
        ]);
    });
}
