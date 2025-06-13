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
      <h2 class="mt-6 text-center text-3xl font-extrabold text-dark-gray">
        Entre na sua conta
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Ou
        <a @click="goToRegister" class="font-medium text-primary-red hover:text-red-700 cursor-pointer">
          crie uma nova conta
        </a>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="errors.form" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ errors.form }}</h3>
              </div>
            </div>
          </div>

          <Input
            v-model="login"
            label="E-mail"
            type="email"
            autocomplete="email"
            required
            :error="errors.login"
          />

          <Input
            v-model="senha"
            label="Senha"
            type="password"
            autocomplete="current-password"
            required
            :error="errors.senha"
          />

          <div>
            <Button
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              fullWidth
            >
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
