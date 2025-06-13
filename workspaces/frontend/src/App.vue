<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);

const goToHome = () => router.push('/');
const goToRecipes = () => router.push('/recipes');
const goToCategories = () => router.push('/categories');
const goToMyRecipes = () => router.push('/my-recipes');
const goToProfile = () => router.push('/profile');
const goToLogin = () => router.push('/login');
const goToRegister = () => router.push('/register');

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center cursor-pointer" @click="goToHome">
              <span class="text-xl font-bold text-primary-red">Código Gourmet</span>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a @click="goToRecipes" class="cursor-pointer border-transparent text-gray-500 hover:border-primary-red hover:text-primary-red inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Receitas
              </a>
              <a @click="goToCategories" class="cursor-pointer border-transparent text-gray-500 hover:border-primary-red hover:text-primary-red inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Categorias
              </a>
              <a v-if="isLoggedIn" @click="goToMyRecipes" class="cursor-pointer border-transparent text-gray-500 hover:border-primary-red hover:text-primary-red inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Minhas Receitas
              </a>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <div v-if="isLoggedIn" class="ml-3 relative flex items-center space-x-4">
              <a @click="goToProfile" class="cursor-pointer text-gray-500 hover:text-primary-red">
                Meu Perfil
              </a>
              <button @click="handleLogout" class="bg-white p-1 rounded-full text-gray-500 hover:text-primary-red focus:outline-none">
                Sair
              </button>
            </div>
            <div v-else class="ml-3 relative flex items-center space-x-4">
              <a @click="goToLogin" class="cursor-pointer text-gray-500 hover:text-primary-red">
                Entrar
              </a>
              <a @click="goToRegister" class="cursor-pointer bg-primary-red text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700">
                Cadastrar
              </a>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="flex items-center sm:hidden">
            <button type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none" aria-controls="mobile-menu" aria-expanded="false">
              <span class="sr-only">Abrir menu</span>
              <!-- Icon when menu is closed -->
              <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="text-center text-gray-500 text-sm">
          &copy; {{ new Date().getFullYear() }} Código Gourmet. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Component-specific styles can be added here if needed */
</style>
