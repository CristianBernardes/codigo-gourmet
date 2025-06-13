<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '../../stores/recipeStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/common/Button.vue';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const error = ref('');
const ingredientsList = ref<string[]>([]);

onMounted(async () => {
  const recipeId = Number(route.params.id);
  if (isNaN(recipeId)) {
    error.value = 'ID de receita inválido';
    isLoading.value = false;
    return;
  }

  await loadRecipe(recipeId);
});

const loadRecipe = async (recipeId: number) => {
  isLoading.value = true;
  error.value = '';

  try {
    await recipeStore.fetchRecipeById(recipeId);

    if (recipeStore.currentRecipe?.ingredientes) {
      // Parse ingredients from string to array
      ingredientsList.value = recipeStore.currentRecipe.ingredientes
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
  } catch (err) {
    error.value = 'Erro ao carregar receita. Tente novamente mais tarde.';
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const goToEdit = () => {
  if (recipeStore.currentRecipe) {
    router.push(`/recipes/${recipeStore.currentRecipe.id}/edit`);
  }
};

const confirmDelete = async () => {
  if (!recipeStore.currentRecipe) return;

  if (confirm('Tem certeza que deseja excluir esta receita?')) {
    try {
      await recipeStore.deleteRecipe(recipeStore.currentRecipe.id);
      router.push('/recipes');
    } catch (err) {
      error.value = 'Erro ao excluir receita. Tente novamente mais tarde.';
    }
  }
};

const canEdit = () => {
  if (!authStore.isLoggedIn || !recipeStore.currentRecipe || !authStore.currentUser) return false;
  return recipeStore.currentRecipe.id_usuarios === authStore.currentUser.id;
};

const printRecipe = () => {
  window.print();
};
</script>

<template>
  <div class="min-h-screen bg-light-gray">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex items-center mb-6">
          <Button @click="goBack" variant="outline" size="sm" class="mr-4 print:hidden">
            Voltar
          </Button>
          <h1 v-if="recipeStore.currentRecipe" class="text-2xl font-semibold text-dark-gray">
            {{ recipeStore.currentRecipe.nome }}
          </h1>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4 mb-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
        </div>

        <div v-else-if="recipeStore.currentRecipe" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <!-- Recipe Header -->
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 class="text-lg leading-6 font-medium text-dark-gray">Detalhes da Receita</h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                Categoria: {{ recipeStore.currentRecipe.categoria?.nome || 'Sem categoria' }}
              </p>
            </div>
            <div class="flex space-x-2 print:hidden">
              <Button @click="printRecipe" variant="outline" size="sm">
                Imprimir
              </Button>
              <template v-if="canEdit()">
                <Button @click="goToEdit" variant="secondary" size="sm">
                  Editar
                </Button>
                <Button @click="confirmDelete" variant="danger" size="sm">
                  Excluir
                </Button>
              </template>
            </div>
          </div>

          <!-- Recipe Info -->
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Autor</dt>
                <dd class="mt-1 text-sm text-dark-gray sm:mt-0 sm:col-span-2">
                  {{ recipeStore.currentRecipe.usuario?.nome || 'Usuário desconhecido' }}
                </dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Tempo de Preparo</dt>
                <dd class="mt-1 text-sm text-dark-gray sm:mt-0 sm:col-span-2">
                  {{ recipeStore.currentRecipe.tempo_preparo_minutos }} minutos
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Porções</dt>
                <dd class="mt-1 text-sm text-dark-gray sm:mt-0 sm:col-span-2">
                  {{ recipeStore.currentRecipe.porcoes }}
                </dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Ingredientes</dt>
                <dd class="mt-1 text-sm text-dark-gray sm:mt-0 sm:col-span-2">
                  <ul class="border border-gray-200 rounded-md divide-y divide-gray-200">
                    <li 
                      v-for="(ingredient, index) in ingredientsList" 
                      :key="index"
                      class="pl-3 pr-4 py-3 flex items-center justify-start text-sm"
                    >
                      <span class="ml-2 flex-1">{{ ingredient }}</span>
                    </li>
                  </ul>
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Modo de Preparo</dt>
                <dd class="mt-1 text-sm text-dark-gray sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  {{ recipeStore.currentRecipe.modo_preparo }}
                </dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Data de Criação</dt>
                <dd class="mt-1 text-sm text-dark-gray sm:mt-0 sm:col-span-2">
                  {{ recipeStore.currentRecipe.criado_em ? new Date(recipeStore.currentRecipe.criado_em).toLocaleDateString() : '-' }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body {
    background-color: white;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  .bg-light-gray, .bg-white, .bg-gray-50 {
    background-color: white !important;
  }

  .shadow, .sm\:rounded-lg {
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  .print\:hidden {
    display: none !important;
  }

  /* Prevent extra blank pages */
  html, body {
    height: auto !important;
    overflow: visible !important;
  }

  /* Ensure content fits on page */
  .min-h-screen {
    min-height: auto !important;
  }

  /* Avoid page breaks inside elements */
  dl, dt, dd, li {
    page-break-inside: avoid;
  }

  /* Set explicit size for print */
  @page {
    size: auto;
    margin: 0.5cm;
  }
}
</style>
