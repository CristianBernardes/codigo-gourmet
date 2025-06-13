<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from '../components/common/Button.vue';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-light-gray flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <h1 class="text-9xl font-extrabold text-primary-red">404</h1>
      <h2 class="mt-6 text-3xl font-extrabold text-dark-gray">
        Página não encontrada
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        A página que você está procurando não existe ou foi movida.
      </p>
      <div class="mt-8">
        <Button @click="goHome" variant="primary">
          Voltar para a página inicial
        </Button>
      </div>
    </div>
  </div>
</template>