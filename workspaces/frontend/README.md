# Código Gourmet - Frontend

Este é o frontend do projeto Código Gourmet, desenvolvido com Vue 3, TypeScript e Vite.

## Passo a passo para iniciar o sistema

### Pré-requisitos
- Node.js instalado
- NPM (Node Package Manager) instalado

### Configuração de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
VITE_API_BASE_URL=http://localhost:3000/api
```
Você pode ajustar a URL da API conforme necessário para seu ambiente.

Um arquivo `.env.example` foi incluído no projeto como referência. Você pode copiar este arquivo e renomeá-lo para `.env` para começar.

### Instalação de dependências
```bash
npm install
```

### Iniciar o servidor de desenvolvimento
```bash
npm run dev -- --host 0.0.0.0
```
Isso iniciará o servidor de desenvolvimento Vite. Após a execução, você poderá acessar a aplicação no navegador através do endereço indicado no terminal (geralmente http://localhost:5173).

### Compilar para produção
```bash
npm run build
```
Este comando irá gerar os arquivos otimizados para produção na pasta `dist`.

### Visualizar a versão de produção localmente
```bash
npm run preview
```
Este comando permite visualizar a versão de produção localmente antes de realizar o deploy.

## Tecnologias utilizadas
- Vue 3
- TypeScript
- Vite
- Pinia (gerenciamento de estado)
- Vue Router
- Tailwind CSS
