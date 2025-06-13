<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useRecipeStore } from '../../stores/recipeStore';
import { useRouter } from 'vue-router';
import Button from '../../components/common/Button.vue';

const authStore = useAuthStore();
const recipeStore = useRecipeStore();
const router = useRouter();

const isLoading = ref(true);
const error = ref('');
const currentPage = ref(1);
const pageSize = ref(5);

onMounted(async () => {
  try {
    await authStore.fetchUserProfile();
    if (authStore.currentUser) {
      await loadUserRecipes();
    }
  } catch (err) {
    error.value = 'Erro ao carregar perfil. Tente novamente mais tarde.';
  } finally {
    isLoading.value = false;
  }
});

const loadUserRecipes = async () => {
  if (!authStore.currentUser) return;
  
  try {
    await recipeStore.fetchRecipesByUserId(
      authStore.currentUser.id,
      { page: currentPage.value, pageSize: pageSize.value }
    );
  } catch (err) {
    error.value = 'Erro ao carregar receitas. Tente novamente mais tarde.';
  }
};

const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await loadUserRecipes();
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const goToRecipeDetail = (id: number) => {
  router.push(`/recipes/${id}`);
};

const goToRecipeEdit = (id: number) => {
  router.push(`/recipes/${id}/edit`);
};

const goToCreateRecipe = () => {
  router.push('/recipes/create');
};

const confirmDeleteRecipe = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta receita?')) {
    try {
      await recipeStore.deleteRecipe(id);
      await loadUserRecipes();
    } catch (err) {
      error.value = 'Erro ao excluir receita. Tente novamente mais tarde.';
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-light-gray">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
        </div>
        
        <div v-else-if="error" class="rounded-md bg-red-50 p-4 mb-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>
        
        <div v-else>
          <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 class="text-lg leading-6 font-medium text-dark-gray">Perfil do Usuário</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">Informações pessoais</p>
              </div>
              <Button @click="handleLogout" variant="outline" size="sm">Sair</Button>
            </div>
            <div class="border-t border-gray-200">
              <dl>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Nome completo</dt>
                  <dd class="mt-1 text-sm text-dark-gray sm:mt-0 sm:col-span-2">
                    {{ authStore.currentUser?.nome }}
                  </dd>
                </div>
                <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">E-mail</dt>
                  <dd class="mt-1 text-sm text-dark-gray sm:mt-0 sm:col-span-2">
                    {{ authStore.currentUser?.login }}
                  </dd>
                </div>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Membro desde</dt>
                  <dd class="mt-1 text-sm text-dark-gray sm:mt-0 sm:col-span-2">
                    {{ authStore.currentUser?.criado_em ? new Date(authStore.currentUser.criado_em).toLocaleDateString() : '-' }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 class="text-lg leading-6 font-medium text-dark-gray">Minhas Receitas</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  Receitas que você criou
                </p>
              </div>
              <Button @click="goToCreateRecipe" variant="primary" size="sm">Nova Receita</Button>
            </div>
            
            <div v-if="recipeStore.recipes.length === 0" class="px-4 py-5 sm:p-6 text-center">
              <p class="text-gray-500">Você ainda não criou nenhuma receita.</p>
            </div>
            
            <div v-else>
              <ul class="divide-y divide-gray-200">
                <li v-for="recipe in recipeStore.recipes" :key="recipe.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="ml-3">
                        <p class="text-sm font-medium text-primary-red cursor-pointer" @click="goToRecipeDetail(recipe.id)">
                          {{ recipe.nome }}
                        </p>
                        <p class="text-sm text-gray-500">
                          Categoria: {{ recipe.categoria?.nome || 'Sem categoria' }}
                        </p>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <Button @click="goToRecipeEdit(recipe.id)" variant="secondary" size="sm">Editar</Button>
                      <Button @click="confirmDeleteRecipe(recipe.id)" variant="danger" size="sm">Excluir</Button>
                    </div>
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
  </div>
</template>