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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
function seed(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Deletes ALL existing entries
        yield knex('categorias').del();
        // Inserts seed entries
        yield knex('categorias').insert([
            { id: 1, nome: 'Bolos e tortas doces' },
            { id: 2, nome: 'Carnes' },
            { id: 3, nome: 'Aves' },
            { id: 4, nome: 'Peixes e frutos do mar' },
            { id: 5, nome: 'Saladas, molhos e acompanhamentos' },
            { id: 6, nome: 'Sopas' },
            { id: 7, nome: 'Massas' },
            { id: 8, nome: 'Bebidas' },
            { id: 9, nome: 'Doces e sobremesas' },
            { id: 10, nome: 'Lanches' },
            { id: 11, nome: 'Prato Único' },
            { id: 12, nome: 'Light' },
            { id: 13, nome: 'Alimentação Saudável' },
            { id: 14, nome: 'Vegetariano' },
            { id: 15, nome: 'Vegano' }
        ]);
    });
}
