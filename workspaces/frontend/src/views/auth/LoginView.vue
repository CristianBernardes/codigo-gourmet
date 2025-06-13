<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/common/Button.vue';
import Input from '../../components/common/Input.vue';

const router = useRouter();
const authStore = useAuthStore();

const login = ref('');
const senha = ref('');
const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

const validateForm = (): boolean => {
  errors.value = {};

  if (!login.value.trim()) {
    errors.value.login = 'O e-mail é obrigatório';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login.value)) {
    errors.value.login = 'Digite um e-mail válido';
  }

  if (!senha.value) {
    errors.value.senha = 'A senha é obrigatória';
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    await authStore.login({ login: login.value, senha: senha.value });
    router.push('/recipes');
  } catch (error: any) {
    if (error.response?.status === 401) {
      errors.value.form = 'E-mail ou senha inválidos';
    } else {
      errors.value.form = 'Ocorreu um erro ao fazer login. Tente novamente.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="min-h-screen bg-light-gray flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-dark-gray">
          Entre na sua conta
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Acesse suas receitas favoritas e compartilhe suas criações
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-6 shadow-lg sm:rounded-lg sm:px-10 border border-gray-100">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="errors.form" class="rounded-md bg-red-50 p-4 border border-red-200">
            <div class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ errors.form }}</h3>
              </div>
            </div>
          </div>

          <div class="relative">
            <label for="email-input" class="block text-sm font-medium text-dark-gray mb-1">
              E-mail <span class="text-red-500">*</span>
            </label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email-input"
                v-model="login"
                type="email"
                autocomplete="email"
                required
                class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red sm:text-sm"
                :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500': errors.login }"
                placeholder="seu@email.com"
              />
            </div>
            <p v-if="errors.login" class="mt-1 text-sm text-red-600">{{ errors.login }}</p>
          </div>

          <div class="relative">
            <label for="password-input" class="block text-sm font-medium text-dark-gray mb-1">
              Senha <span class="text-red-500">*</span>
            </label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                id="password-input"
                v-model="senha"
                type="password"
                autocomplete="current-password"
                required
                class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red sm:text-sm"
                :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500': errors.senha }"
                placeholder="••••••••"
              />
            </div>
            <p v-if="errors.senha" class="mt-1 text-sm text-red-600">{{ errors.senha }}</p>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-600">
                Lembrar-me
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-primary-red hover:text-red-700">
                Esqueceu a senha?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              fullWidth
            >
              <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Entrar
            </Button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          <div class="mt-6 text-center">
            <a @click="goToRegister" class="font-medium text-primary-red hover:text-red-700 cursor-pointer inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Crie uma nova conta
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
