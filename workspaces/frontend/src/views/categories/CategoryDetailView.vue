<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCategoryStore } from '../../stores/categoryStore';
import { useRecipeStore } from '../../stores/recipeStore';
import Button from '../../components/common/Button.vue';

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const recipeStore = useRecipeStore();

const isLoading = ref(true);
const error = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

onMounted(async () => {
  const categoryId = Number(route.params.id);
  if (isNaN(categoryId)) {
    error.value = 'ID de categoria inválido';
    isLoading.value = false;
    return;
  }
  
  await loadCategory(categoryId);
});

const loadCategory = async (categoryId: number) => {
  isLoading.value = true;
  error.value = '';
  
  try {
    await categoryStore.fetchCategoryById(categoryId);
    await loadCategoryRecipes(categoryId);
  } catch (err) {
    error.value = 'Erro ao carregar categoria. Tente novamente mais tarde.';
  } finally {
    isLoading.value = false;
  }
};

const loadCategoryRecipes = async (categoryId: number) => {
  try {
    await recipeStore.fetchRecipesByCategoryId(
      categoryId,
      { page: currentPage.value, pageSize: pageSize.value }
    );
  } catch (err) {
    error.value = 'Erro ao carregar receitas. Tente novamente mais tarde.';
  }
};

const handlePageChange = async (page: number) => {
  currentPage.value = page;
  const categoryId = Number(route.params.id);
  if (!isNaN(categoryId)) {
    await loadCategoryRecipes(categoryId);
  }
};

const goToRecipeDetail = (id: number) => {
  router.push(`/recipes/${id}`);
};

const goBack = () => {
  router.push('/categories');
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
          <h1 v-if="categoryStore.currentCategory" class="text-2xl font-semibold text-dark-gray">
            Receitas na categoria: {{ categoryStore.currentCategory.nome }}
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
        
        <div v-else-if="categoryStore.currentCategory">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div v-if="recipeStore.recipes.length === 0" class="px-4 py-5 sm:p-6 text-center">
              <p class="text-gray-500">Nenhuma receita encontrada nesta categoria.</p>
            </div>
            
            <ul v-else class="divide-y divide-gray-200">
              <li 
                v-for="recipe in recipeStore.recipes" 
                :key="recipe.id" 
                class="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                @click="goToRecipeDetail(recipe.id)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-primary-red">
                      {{ recipe.nome }}
                    </p>
                    <div class="mt-1 flex items-center text-sm text-gray-500">
                      <span>{{ recipe.tempo_preparo_minutos }} minutos</span>
                      <span class="mx-1">•</span>
                      <span>{{ recipe.porcoes }} porções</span>
                    </div>
                    <p class="text-sm text-gray-500">
                      Por: {{ recipe.usuario?.nome || 'Usuário desconhecido' }}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Ver Receita</Button>
                </div>
              </li>
            </ul>
            
            <!-- Pagination -->
            <div v-if="recipeStore.totalPages > 1" class="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div class="flex-1 flex justify-between sm:hidden">
                <Button 
                  :disabled="currentPage === 1" 
                  @click="handlePageChange(currentPage - 1)" 
                  variant="outline" 
                  size="sm"
                >
                  Anterior
                </Button>
                <Button 
                  :disabled="currentPage === recipeStore.totalPages" 
                  @click="handlePageChange(currentPage + 1)" 
                  variant="outline" 
                  size="sm"
                >
                  Próxima
                </Button>
              </div>
              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    Mostrando <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> a 
                    <span class="font-medium">
                      {{ Math.min(currentPage * pageSize, recipeStore.pagination.totalItems) }}
                    </span> de 
                    <span class="font-medium">{{ recipeStore.pagination.totalItems }}</span> resultados
                  </p>
                </div>
                <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <a 
                      v-for="page in recipeStore.totalPages" 
                      :key="page"
                      @click="handlePageChange(page)"
                      :class="[
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer',
                        currentPage === page 
                          ? 'z-10 bg-primary-red border-primary-red text-white' 
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      ]"
                    >
                      {{ page }}
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>