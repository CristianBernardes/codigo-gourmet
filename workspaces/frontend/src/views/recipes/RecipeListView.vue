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
        <div class="bg-white shadow p-4 rounded-lg mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="col-span-1">
              <Input
                v-model="searchTerm"
                placeholder="Buscar receitas..."
                :disabled="isSearching"
              />
            </div>
            <div>
              <select
                v-model="selectedCategory"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring focus:ring-primary-red focus:ring-opacity-50"
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
            <div>
              <select
                v-model="selectedUserId"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring focus:ring-primary-red focus:ring-opacity-50"
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
          <div class="mt-4 flex justify-end">
            <Button 
              @click="clearSearch" 
              variant="outline" 
              size="sm" 
              :disabled="isSearching || (!searchTerm && !selectedCategory && !selectedUserId)"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4 mb-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <div v-if="isLoading || isSearching" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
        </div>

        <div v-else>
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div v-if="recipeStore.recipes.length === 0" class="px-4 py-5 sm:p-6 text-center">
              <p class="text-gray-500">Nenhuma receita encontrada.</p>
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
                      <span class="mx-1">•</span>
                      <span>Categoria: {{ recipe.categoria?.nome || 'Sem categoria' }}</span>
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
