<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '../../stores/recipeStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/common/Button.vue';
import Input from '../../components/common/Input.vue';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const isSaving = ref(false);
const error = ref('');
const recipeId = computed(() => {
  const id = Number(route.params.id);
  return isNaN(id) ? null : id;
});
const isEditMode = computed(() => !!recipeId.value);

// Form data
const nome = ref('');
const id_categorias = ref<number | null>(null);
const tempo_preparo_minutos = ref<number | null>(null);
const porcoes = ref<number | null>(null);
const ingredientes = ref('');
const modo_preparo = ref('');

// Form validation
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  try {
    // Load categories
    await categoryStore.fetchCategories();

    // If editing, load recipe data
    if (isEditMode.value && recipeId.value) {
      await loadRecipe(recipeId.value);
    } else {
      isLoading.value = false;
    }
  } catch (err) {
    error.value = 'Erro ao carregar dados. Tente novamente mais tarde.';
    isLoading.value = false;
  }
});

const loadRecipe = async (id: number) => {
  try {
    await recipeStore.fetchRecipeById(id);

    if (recipeStore.currentRecipe) {
      // Check if user is the owner
      if (authStore.currentUser?.id !== recipeStore.currentRecipe.id_usuarios) {
        error.value = 'Você não tem permissão para editar esta receita.';
        setTimeout(() => {
          router.push(`/recipes/${id}`);
        }, 2000);
        return;
      }

      // Populate form
      nome.value = recipeStore.currentRecipe.nome;
      id_categorias.value = recipeStore.currentRecipe.id_categorias;
      tempo_preparo_minutos.value = recipeStore.currentRecipe.tempo_preparo_minutos;
      porcoes.value = recipeStore.currentRecipe.porcoes;
      ingredientes.value = recipeStore.currentRecipe.ingredientes;
      modo_preparo.value = recipeStore.currentRecipe.modo_preparo;
    }
  } catch (err) {
    error.value = 'Erro ao carregar receita. Tente novamente mais tarde.';
  } finally {
    isLoading.value = false;
  }
};

const validateForm = (): boolean => {
  errors.value = {};

  if (!nome.value.trim()) {
    errors.value.nome = 'O nome da receita é obrigatório';
  }

  if (!modo_preparo.value.trim()) {
    errors.value.modo_preparo = 'O modo de preparo é obrigatório';
  }

  if (!ingredientes.value.trim()) {
    errors.value.ingredientes = 'Os ingredientes são obrigatórios';
  }

  if (tempo_preparo_minutos.value === null || tempo_preparo_minutos.value <= 0) {
    errors.value.tempo_preparo_minutos = 'O tempo de preparo deve ser maior que zero';
  }

  if (porcoes.value === null || porcoes.value <= 0) {
    errors.value.porcoes = 'O número de porções deve ser maior que zero';
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSaving.value = true;

  const recipeData = {
    nome: nome.value.trim(),
    id_categorias: id_categorias.value,
    tempo_preparo_minutos: tempo_preparo_minutos.value,
    porcoes: porcoes.value,
    ingredientes: ingredientes.value.trim(),
    modo_preparo: modo_preparo.value.trim()
  };

  try {
    if (isEditMode.value && recipeId.value) {
      // Update existing recipe
      const updatedRecipe = await recipeStore.updateRecipe(recipeId.value, recipeData);
      router.push(`/recipes/${updatedRecipe.id}`);
    } else {
      // Create new recipe
      const newRecipe = await recipeStore.createRecipe(recipeData);
      router.push(`/recipes/${newRecipe.id}`);
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao salvar receita. Tente novamente mais tarde.';
  } finally {
    isSaving.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="min-h-screen bg-light-gray flex flex-col">
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
      <div class="flex items-center mb-6">
        <Button @click="goBack" variant="outline" size="sm" class="mr-4">
          Voltar
        </Button>
        <h1 class="text-2xl font-semibold text-dark-gray">
          {{ isEditMode ? 'Editar Receita' : 'Nova Receita' }}
        </h1>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>

      <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="px-6 py-8">
          <form @submit.prevent="handleSubmit" class="space-y-8">
              <div class="bg-light-gray p-4 rounded-lg border border-gray-200">
                <label class="block text-sm font-medium text-dark-gray mb-2">
                  Nome da Receita <span class="text-red-500">*</span>
                </label>
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input
                    v-model="nome"
                    type="text"
                    required
                    class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red text-base"
                    placeholder="Ex: Bolo de Chocolate com Cobertura de Brigadeiro"
                  />
                </div>
                <p v-if="errors.nome" class="mt-2 text-sm text-red-600 font-medium">{{ errors.nome }}</p>
                <p class="mt-2 text-xs text-gray-600">Escolha um nome descritivo e atrativo para sua receita.</p>
              </div>

              <div class="bg-light-gray p-4 rounded-lg border border-gray-200">
                <label class="block text-sm font-medium text-dark-gray mb-2">
                  Categoria <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <select
                    v-model="id_categorias"
                    class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-2 focus:ring-primary-red focus:ring-opacity-50 appearance-none bg-white pr-10 py-2 text-base"
                  >
                    <option :value="null">Selecione uma categoria</option>
                    <option 
                      v-for="category in categoryStore.allCategories" 
                      :key="category.id" 
                      :value="category.id"
                    >
                      {{ category.nome }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-600">Escolha a categoria que melhor representa sua receita.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-light-gray p-4 rounded-lg border border-gray-200">
                <div>
                  <label class="block text-sm font-medium text-dark-gray mb-2">
                    Tempo de Preparo (minutos) <span class="text-red-500">*</span>
                  </label>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <input
                      v-model="tempo_preparo_minutos"
                      type="number"
                      min="1"
                      required
                      class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red text-base"
                      placeholder="Ex: 30"
                    />
                  </div>
                  <p v-if="errors.tempo_preparo_minutos" class="mt-2 text-sm text-red-600 font-medium">{{ errors.tempo_preparo_minutos }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-dark-gray mb-2">
                    Porções <span class="text-red-500">*</span>
                  </label>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <input
                      v-model="porcoes"
                      type="number"
                      min="1"
                      required
                      class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red text-base"
                      placeholder="Ex: 4"
                    />
                  </div>
                  <p v-if="errors.porcoes" class="mt-2 text-sm text-red-600 font-medium">{{ errors.porcoes }}</p>
                </div>
              </div>

              <div class="bg-light-gray p-4 rounded-lg border border-gray-200">
                <label class="block text-sm font-medium text-dark-gray mb-2">
                  Ingredientes <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                  <textarea
                    v-model="ingredientes"
                    rows="5"
                    class="shadow-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red block w-full text-base border-gray-300 rounded-md"
                    placeholder="Digite os ingredientes (um por linha)"
                    required
                  ></textarea>
                </div>
                <p v-if="errors.ingredientes" class="mt-2 text-sm text-red-600 font-medium">{{ errors.ingredientes }}</p>
                <p class="mt-2 text-xs text-gray-600">Digite cada ingrediente em uma linha separada. Exemplo:<br>- 2 xícaras de farinha<br>- 3 ovos<br>- 1 colher de fermento</p>
              </div>

              <div class="bg-light-gray p-4 rounded-lg border border-gray-200">
                <label class="block text-sm font-medium text-dark-gray mb-2">
                  Modo de Preparo <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                  <textarea
                    v-model="modo_preparo"
                    rows="8"
                    class="shadow-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red block w-full text-base border-gray-300 rounded-md"
                    placeholder="Digite o modo de preparo passo a passo"
                    required
                  ></textarea>
                </div>
                <p v-if="errors.modo_preparo" class="mt-2 text-sm text-red-600 font-medium">{{ errors.modo_preparo }}</p>
                <p class="mt-2 text-xs text-gray-600">Descreva o passo a passo do preparo de forma clara e objetiva.</p>
              </div>

              <div class="flex flex-col-reverse sm:flex-row sm:justify-between items-center pt-6 border-t border-gray-200">
                <Button @click="goBack" variant="outline" type="button" class="mt-3 sm:mt-0 w-full sm:w-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                  </svg>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  :loading="isSaving"
                  :disabled="isSaving"
                  class="w-full sm:w-auto"
                >
                  <svg v-if="!isSaving" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  {{ isEditMode ? 'Atualizar Receita' : 'Criar Receita' }}
                </Button>
              </div>
            </form>
          </div>
        </div>
    </div>
  </div>
</template>
