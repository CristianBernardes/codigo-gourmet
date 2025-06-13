<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/common/Button.vue';
import Input from '../../components/common/Input.vue';

const router = useRouter();
const authStore = useAuthStore();

const nome = ref('');
const login = ref('');
const senha = ref('');
const confirmSenha = ref('');
const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

const validateForm = (): boolean => {
  errors.value = {};

  if (!nome.value.trim()) {
    errors.value.nome = 'O nome é obrigatório';
  }

  if (!login.value.trim()) {
    errors.value.login = 'O e-mail é obrigatório';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login.value)) {
    errors.value.login = 'Digite um e-mail válido';
  }

  if (!senha.value) {
    errors.value.senha = 'A senha é obrigatória';
  } else if (senha.value.length < 6) {
    errors.value.senha = 'A senha deve ter pelo menos 6 caracteres';
  }

  if (!confirmSenha.value) {
    errors.value.confirmSenha = 'Confirme sua senha';
  } else if (senha.value !== confirmSenha.value) {
    errors.value.confirmSenha = 'As senhas não coincidem';
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    await authStore.register({
      nome: nome.value,
      login: login.value,
      senha: senha.value
    });
    router.push('/recipes');
  } catch (error: any) {
    if (error.response?.status === 409) {
      errors.value.login = 'Este e-mail já está em uso';
    } else {
      errors.value.form = 'Ocorreu um erro ao criar sua conta. Tente novamente.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-light-gray flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-dark-gray">
          Crie sua conta
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Comece a compartilhar suas receitas culinárias favoritas
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
            <label for="name-input" class="block text-sm font-medium text-dark-gray mb-1">
              Nome <span class="text-red-500">*</span>
            </label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                id="name-input"
                v-model="nome"
                type="text"
                autocomplete="name"
                required
                class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red sm:text-sm"
                :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500': errors.nome }"
                placeholder="Seu nome completo"
              />
            </div>
            <p v-if="errors.nome" class="mt-1 text-sm text-red-600">{{ errors.nome }}</p>
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
                autocomplete="new-password"
                required
                class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red sm:text-sm"
                :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500': errors.senha }"
                placeholder="••••••••"
              />
            </div>
            <p v-if="errors.senha" class="mt-1 text-sm text-red-600">{{ errors.senha }}</p>
            <p class="mt-1 text-xs text-gray-500">A senha deve ter pelo menos 6 caracteres</p>
          </div>

          <div class="relative">
            <label for="confirm-password-input" class="block text-sm font-medium text-dark-gray mb-1">
              Confirme a senha <span class="text-red-500">*</span>
            </label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                id="confirm-password-input"
                v-model="confirmSenha"
                type="password"
                autocomplete="new-password"
                required
                class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red sm:text-sm"
                :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500': errors.confirmSenha }"
                placeholder="••••••••"
              />
            </div>
            <p v-if="errors.confirmSenha" class="mt-1 text-sm text-red-600">{{ errors.confirmSenha }}</p>
          </div>

          <div class="pt-2">
            <Button
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              fullWidth
            >
              <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Criar conta
            </Button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Já tem uma conta?</span>
            </div>
          </div>

          <div class="mt-6 text-center">
            <a @click="goToLogin" class="font-medium text-primary-red hover:text-red-700 cursor-pointer inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
              Entre com sua conta existente
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
