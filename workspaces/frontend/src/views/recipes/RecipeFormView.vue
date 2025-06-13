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
  <div class="min-h-screen bg-light-gray">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex items-center mb-6">
          <Button @click="goBack" variant="outline" size="sm" class="mr-4">
            Voltar
          </Button>
          <h1 class="text-2xl font-semibold text-dark-gray">
            {{ isEditMode ? 'Editar Receita' : 'Nova Receita' }}
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
        
        <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div>
                <Input
                  v-model="nome"
                  label="Nome da Receita"
                  placeholder="Digite o nome da receita"
                  required
                  :error="errors.nome"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-dark-gray mb-1">
                  Categoria
                </label>
                <select
                  v-model="id_categorias"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring focus:ring-primary-red focus:ring-opacity-50"
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
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    v-model="tempo_preparo_minutos"
                    label="Tempo de Preparo (minutos)"
                    type="number"
                    min="1"
                    required
                    :error="errors.tempo_preparo_minutos"
                  />
                </div>
                
                <div>
                  <Input
                    v-model="porcoes"
                    label="Porções"
                    type="number"
                    min="1"
                    required
                    :error="errors.porcoes"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-dark-gray mb-1">
                  Ingredientes <span class="text-red-500">*</span>
                </label>
                <div class="mt-1">
                  <textarea
                    v-model="ingredientes"
                    rows="5"
                    class="shadow-sm focus:ring-primary-red focus:border-primary-red block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Digite os ingredientes (um por linha)"
                    required
                  ></textarea>
                </div>
                <p v-if="errors.ingredientes" class="mt-1 text-sm text-red-600">{{ errors.ingredientes }}</p>
                <p class="mt-1 text-xs text-gray-500">Digite cada ingrediente em uma linha separada.</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-dark-gray mb-1">
                  Modo de Preparo <span class="text-red-500">*</span>
                </label>
                <div class="mt-1">
                  <textarea
                    v-model="modo_preparo"
                    rows="8"
                    class="shadow-sm focus:ring-primary-red focus:border-primary-red block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Digite o modo de preparo"
                    required
                  ></textarea>
                </div>
                <p v-if="errors.modo_preparo" class="mt-1 text-sm text-red-600">{{ errors.modo_preparo }}</p>
              </div>
              
              <div class="flex justify-end space-x-3">
                <Button @click="goBack" variant="outline" type="button">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  :loading="isSaving"
                  :disabled="isSaving"
                >
                  {{ isEditMode ? 'Atualizar Receita' : 'Criar Receita' }}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>