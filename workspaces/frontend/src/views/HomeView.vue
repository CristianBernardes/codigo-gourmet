<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '../stores/recipeStore';
import { useCategoryStore } from '../stores/categoryStore';
import Button from '../components/common/Button.vue';

const router = useRouter();
const recipeStore = useRecipeStore();
const categoryStore = useCategoryStore();

const isLoading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    await Promise.all([
      recipeStore.fetchRecipes({ page: 1, pageSize: 6 }),
      categoryStore.fetchCategories()
    ]);
  } catch (err) {
    error.value = 'Erro ao carregar dados. Tente novamente mais tarde.';
  } finally {
    isLoading.value = false;
  }
});

const goToRecipeDetail = (id: number) => {
  router.push(`/recipes/${id}`);
};

const goToRecipes = () => {
  router.push('/recipes');
};

const goToCategory = (id: number) => {
  router.push(`/categories/${id}`);
};

const goToCategories = () => {
  router.push('/categories');
};
</script>

<template>
  <div class="min-h-screen bg-light-gray">
    <!-- Hero Section -->
    <div class="bg-white">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold tracking-tight text-dark-gray sm:text-5xl md:text-6xl">
            <span class="block">Código Gourmet</span>
            <span class="block text-primary-red">Receitas Deliciosas</span>
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Descubra, compartilhe e organize suas receitas favoritas em um só lugar.
            Explore nossa coleção de receitas deliciosas ou adicione as suas próprias criações.
          </p>
          <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div class="rounded-md shadow">
              <Button @click="goToRecipes" variant="primary" size="lg">
                Explorar Receitas
              </Button>
            </div>
            <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Button @click="goToCategories" variant="outline" size="lg">
                Ver Categorias
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Recipes Section -->
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-dark-gray sm:text-4xl">
          Receitas em Destaque
        </h2>
        <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Confira algumas das nossas receitas mais recentes
        </p>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 p-4 mt-6">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
          </div>
        </div>
      </div>
      
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
      
      <div v-else-if="recipeStore.recipes.length === 0" class="text-center mt-12">
        <p class="text-gray-500">Nenhuma receita encontrada.</p>
      </div>
      
      <div v-else class="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
        <div 
          v-for="recipe in recipeStore.recipes" 
          :key="recipe.id" 
          class="flex flex-col rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
          @click="goToRecipeDetail(recipe.id)"
        >
          <div class="flex-1 bg-white p-6 flex flex-col justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-secondary-orange">
                {{ recipe.categoria?.nome || 'Sem categoria' }}
              </p>
              <div class="block mt-2">
                <p class="text-xl font-semibold text-dark-gray">{{ recipe.nome }}</p>
                <div class="mt-3 flex items-center text-sm text-gray-500">
                  <span>{{ recipe.tempo_preparo_minutos }} minutos</span>
                  <span class="mx-1">•</span>
                  <span>{{ recipe.porcoes }} porções</span>
                </div>
              </div>
            </div>
            <div class="mt-6 flex items-center">
              <div class="flex-shrink-0">
                <span class="sr-only">{{ recipe.usuario?.nome }}</span>
                <div class="h-10 w-10 rounded-full bg-primary-red flex items-center justify-center text-white font-bold">
                  {{ recipe.usuario?.nome.charAt(0) || '?' }}
                </div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-dark-gray">
                  {{ recipe.usuario?.nome || 'Usuário desconhecido' }}
                </p>
                <div class="flex space-x-1 text-sm text-gray-500">
                  <time>{{ new Date(recipe.criado_em || '').toLocaleDateString() }}</time>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-12 text-center">
        <Button @click="goToRecipes" variant="secondary">
          Ver Todas as Receitas
        </Button>
      </div>
    </div>

    <!-- Categories Section -->
    <div class="bg-white">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-dark-gray sm:text-4xl">
            Categorias
          </h2>
          <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Explore nossas receitas por categoria
          </p>
        </div>
        
        <div v-if="categoryStore.allCategories.length === 0" class="text-center mt-12">
          <p class="text-gray-500">Nenhuma categoria encontrada.</p>
        </div>
        
        <div v-else class="mt-10">
          <div class="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            <div 
              v-for="category in categoryStore.allCategories.slice(0, 8)" 
              :key="category.id" 
              class="bg-light-gray rounded-lg p-6 text-center cursor-pointer hover:bg-gray-200 transition-colors duration-300"
              @click="goToCategory(category.id)"
            >
              <h3 class="text-lg font-medium text-primary-red">{{ category.nome }}</h3>
            </div>
          </div>
          
          <div class="mt-10 text-center">
            <Button @click="goToCategories" variant="secondary">
              Ver Todas as Categorias
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>