<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '../../stores/recipeStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { useAuthStore } from '../../stores/authStore';
import { useUsuarioStore } from '../../stores/usuarioStore';
import Button from '../../components/common/Button.vue';
import Input from '../../components/common/Input.vue';

const router = useRouter();
const recipeStore = useRecipeStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();
const usuarioStore = useUsuarioStore();

const isLoading = ref(true);
const error = ref('');
const searchTerm = ref('');
const selectedCategory = ref<number | null>(null);
const selectedUserId = ref<number | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);
const isSearching = ref(false);

onMounted(async () => {
  try {
    await Promise.all([
      loadRecipes(),
      categoryStore.fetchCategories(),
      usuarioStore.fetchAllUsers()
    ]);
  } catch (err) {
    error.value = 'Erro ao carregar dados. Tente novamente mais tarde.';
  } finally {
    isLoading.value = false;
  }
});

const loadRecipes = async () => {
  try {
    await recipeStore.fetchRecipes({
      page: currentPage.value,
      pageSize: pageSize.value
    });
  } catch (err) {
    error.value = 'Erro ao carregar receitas. Tente novamente mais tarde.';
  }
};

const searchRecipes = async () => {
  isSearching.value = true;
  currentPage.value = 1;

  try {
    await recipeStore.searchRecipes({
      termo_busca: searchTerm.value,
      id_categorias: selectedCategory.value || undefined,
      id_usuarios: selectedUserId.value || undefined,
      page: currentPage.value,
      pageSize: pageSize.value
    });
  } catch (err) {
    error.value = 'Erro na busca. Tente novamente mais tarde.';
  } finally {
    isSearching.value = false;
  }
};

const clearSearch = async () => {
  searchTerm.value = '';
  selectedCategory.value = null;
  selectedUserId.value = null;
  currentPage.value = 1;
  await loadRecipes();
};

const handlePageChange = async (page: number) => {
  currentPage.value = page;

  if (searchTerm.value || selectedCategory.value || selectedUserId.value) {
    await searchRecipes();
  } else {
    await loadRecipes();
  }
};

const goToRecipeDetail = (id: number) => {
  router.push(`/recipes/${id}`);
};

const goToCreateRecipe = () => {
  router.push('/recipes/create');
};

// Debounce search
let searchTimeout: number | null = null;
watch(searchTerm, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    searchRecipes();
  }, 500) as unknown as number;
});

// Category change
watch(selectedCategory, () => {
  searchRecipes();
});

// User change
watch(selectedUserId, () => {
  searchRecipes();
});
</script>

<template>
  <div class="min-h-screen bg-light-gray">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 class="text-2xl font-semibold text-dark-gray mb-4 sm:mb-0">Receitas Culinárias</h1>
          <Button
            v-if="authStore.isLoggedIn"
            @click="goToCreateRecipe"
            variant="primary"
          >
            Nova Receita
          </Button>
        </div>

        <!-- Search and Filter -->
        <div class="bg-white shadow-lg rounded-xl mb-8 overflow-hidden border border-gray-100">
          <div class="bg-gradient-to-r from-primary-red to-secondary-orange p-4 text-white">
            <h2 class="text-lg font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
              Filtros de Busca
            </h2>
          </div>

          <div class="p-5">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Termo de Busca</label>
                <div class="relative rounded-md shadow-md hover:shadow-lg transition-all duration-300 group">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-red opacity-70 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <Input
                    v-model="searchTerm"
                    placeholder="Buscar receitas..."
                    :disabled="isSearching"
                    class="pl-10 py-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 focus:border-primary-red focus:ring-primary-red focus:ring-opacity-50 focus:shadow-inner placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <select
                    v-model="selectedCategory"
                    class="block w-full pl-10 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring focus:ring-primary-red focus:ring-opacity-50"
                    :disabled="isSearching"
                  >
                    <option :value="null">Todas as categorias</option>
                    <option
                      v-for="category in categoryStore.allCategories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.nome }}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <select
                    v-model="selectedUserId"
                    class="block w-full pl-10 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring focus:ring-primary-red focus:ring-opacity-50"
                    :disabled="isSearching"
                  >
                    <option :value="null">Todos os usuários</option>
                    <option
                      v-for="user in usuarioStore.allUsers"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ user.nome }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <Button
                @click="clearSearch"
                variant="outline"
                size="sm"
                class="mr-2 hover:bg-gray-100 transition-colors"
                :disabled="isSearching || (!searchTerm && !selectedCategory && !selectedUserId)"
              >
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  Limpar Filtros
                </span>
              </Button>
              <Button
                @click="searchRecipes"
                variant="primary"
                size="sm"
                :disabled="isSearching"
                class="bg-primary-red hover:bg-red-700 transition-colors"
              >
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                  </svg>
                  Buscar
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div v-if="error" class="rounded-xl bg-red-50 p-6 mb-6 border border-red-200 shadow-md">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="text-base font-medium text-red-800">Ocorreu um erro</h3>
              <p class="text-sm text-red-700 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <div v-if="isLoading || isSearching" class="flex flex-col justify-center items-center h-64 bg-white shadow-lg rounded-xl p-8 border border-gray-100">
          <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-red mb-4"></div>
          <p class="text-gray-600 font-medium mt-4">Carregando receitas...</p>
        </div>

        <div v-else>
          <div class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-red" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                </svg>
                Receitas Encontradas
              </h2>
            </div>

            <div v-if="recipeStore.recipes.length === 0" class="px-6 py-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-gray-500 text-lg">Nenhuma receita encontrada.</p>
              <p class="text-gray-400 mt-2">Tente ajustar seus filtros de busca.</p>
            </div>

            <ul v-else class="divide-y divide-gray-200">
              <li
                v-for="recipe in recipeStore.recipes"
                :key="recipe.id"
                class="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                @click="goToRecipeDetail(recipe.id)"
              >
                <div class="px-6 py-5 flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-medium text-primary-red truncate">
                      {{ recipe.nome }}
                    </h3>
                    <div class="mt-2 flex flex-wrap items-center text-sm text-gray-500">
                      <div class="flex items-center mr-4 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                        </svg>
                        <span>{{ recipe.tempo_preparo_minutos }} minutos</span>
                      </div>
                      <div class="flex items-center mr-4 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>{{ recipe.porcoes }} porções</span>
                      </div>
                      <div class="flex items-center mr-4 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        <span>{{ recipe.categoria?.nome || 'Sem categoria' }}</span>
                      </div>
                    </div>
                    <div class="mt-1 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                      </svg>
                      <span>{{ recipe.usuario?.nome || 'Usuário desconhecido' }}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    class="ml-4 flex-shrink-0 hover:bg-primary-red hover:text-white transition-colors duration-150"
                  >
                    <span class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                      </svg>
                      Ver Receita
                    </span>
                  </Button>
                </div>
              </li>
            </ul>

            <!-- Pagination -->
            <div v-if="recipeStore.totalPages > 1" class="px-6 py-5 flex items-center justify-between border-t border-gray-200 bg-gray-50">
              <!-- Mobile pagination -->
              <div class="flex-1 flex justify-between sm:hidden">
                <Button
                  :disabled="currentPage === 1"
                  @click="handlePageChange(currentPage - 1)"
                  variant="outline"
                  size="sm"
                  class="flex items-center"
                  :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Anterior
                </Button>
                <Button
                  :disabled="currentPage === recipeStore.totalPages"
                  @click="handlePageChange(currentPage + 1)"
                  variant="outline"
                  size="sm"
                  class="flex items-center"
                  :class="currentPage === recipeStore.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'"
                >
                  Próxima
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </Button>
              </div>

              <!-- Desktop pagination -->
              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    Mostrando <span class="font-medium text-primary-red">{{ (currentPage - 1) * pageSize + 1 }}</span> a
                    <span class="font-medium text-primary-red">
                      {{ Math.min(currentPage * pageSize, recipeStore.pagination.totalItems) }}
                    </span> de
                    <span class="font-medium text-primary-red">{{ recipeStore.pagination.totalItems }}</span> resultados
                  </p>
                </div>
                <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-lg overflow-hidden" aria-label="Pagination">
                    <!-- Previous page button -->
                    <a
                      @click="currentPage > 1 && handlePageChange(currentPage - 1)"
                      :class="[
                        'relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium',
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-500 hover:bg-gray-50 cursor-pointer'
                      ]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </a>

                    <!-- Page numbers -->
                    <a 
                      v-for="page in recipeStore.totalPages" 
                      :key="page"
                      @click="handlePageChange(page)"
                      :class="[
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-150',
                        currentPage === page 
                          ? 'z-10 bg-primary-red border-primary-red text-white' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                      ]"
                    >
                      {{ page }}
                    </a>

                    <!-- Next page button -->
                    <a 
                      @click="currentPage < recipeStore.totalPages && handlePageChange(currentPage + 1)"
                      :class="[
                        'relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium',
                        currentPage === recipeStore.totalPages 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-500 hover:bg-gray-50 cursor-pointer'
                      ]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
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
