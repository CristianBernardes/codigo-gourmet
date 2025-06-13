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
      <h2 class="mt-6 text-center text-3xl font-extrabold text-dark-gray">
        Crie sua conta
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Ou
        <a @click="goToLogin" class="font-medium text-primary-red hover:text-red-700 cursor-pointer">
          entre com sua conta existente
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
            v-model="nome"
            label="Nome"
            type="text"
            autocomplete="name"
            required
            :error="errors.nome"
          />

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
            autocomplete="new-password"
            required
            :error="errors.senha"
          />

          <Input
            v-model="confirmSenha"
            label="Confirme a senha"
            type="password"
            autocomplete="new-password"
            required
            :error="errors.confirmSenha"
          />

          <div>
            <Button
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              fullWidth
            >
              Criar conta
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
