<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoryStore } from '../../stores/categoryStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/common/Button.vue';
import Input from '../../components/common/Input.vue';

const categoryStore = useCategoryStore();
const authStore = useAuthStore();
const router = useRouter();

const isLoading = ref(true);
const isCreating = ref(false);
const isEditing = ref(false);
const newCategoryName = ref('');
const editCategoryId = ref<number | null>(null);
const editCategoryName = ref('');
const error = ref('');

onMounted(async () => {
  await loadCategories();
});

const loadCategories = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    await categoryStore.fetchCategories();
  } catch (err) {
    error.value = 'Erro ao carregar categorias. Tente novamente mais tarde.';
  } finally {
    isLoading.value = false;
  }
};

const showCreateForm = () => {
  isCreating.value = true;
  newCategoryName.value = '';
};

const cancelCreate = () => {
  isCreating.value = false;
  newCategoryName.value = '';
};

const createCategory = async () => {
  if (!newCategoryName.value.trim()) {
    error.value = 'O nome da categoria é obrigatório';
    return;
  }
  
  try {
    await categoryStore.createCategory({ nome: newCategoryName.value.trim() });
    isCreating.value = false;
    newCategoryName.value = '';
  } catch (err: any) {
    if (err.response?.status === 409) {
      error.value = 'Já existe uma categoria com este nome';
    } else {
      error.value = 'Erro ao criar categoria. Tente novamente mais tarde.';
    }
  }
};

const showEditForm = (id: number, name: string) => {
  editCategoryId.value = id;
  editCategoryName.value = name;
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  editCategoryId.value = null;
  editCategoryName.value = '';
};

const updateCategory = async () => {
  if (!editCategoryId.value || !editCategoryName.value.trim()) {
    error.value = 'O nome da categoria é obrigatório';
    return;
  }
  
  try {
    await categoryStore.updateCategory(editCategoryId.value, { nome: editCategoryName.value.trim() });
    isEditing.value = false;
    editCategoryId.value = null;
    editCategoryName.value = '';
  } catch (err: any) {
    if (err.response?.status === 409) {
      error.value = 'Já existe uma categoria com este nome';
    } else {
      error.value = 'Erro ao atualizar categoria. Tente novamente mais tarde.';
    }
  }
};

const confirmDeleteCategory = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta categoria?')) {
    try {
      await categoryStore.deleteCategory(id);
    } catch (err) {
      error.value = 'Erro ao excluir categoria. Tente novamente mais tarde.';
    }
  }
};

const viewCategoryRecipes = (id: number) => {
  router.push(`/categories/${id}`);
};
</script>

<template>
  <div class="min-h-screen bg-light-gray">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-semibold text-dark-gray">Categorias de Receitas</h1>
          <Button 
            v-if="authStore.isLoggedIn && !isCreating" 
            @click="showCreateForm" 
            variant="primary"
          >
            Nova Categoria
          </Button>
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
        
        <div v-else>
          <!-- Create Form -->
          <div v-if="isCreating" class="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-4">
            <h3 class="text-lg leading-6 font-medium text-dark-gray mb-4">Nova Categoria</h3>
            <div class="space-y-4">
              <Input
                v-model="newCategoryName"
                label="Nome da Categoria"
                placeholder="Digite o nome da categoria"
                required
              />
              <div class="flex space-x-2">
                <Button @click="createCategory" variant="primary">Salvar</Button>
                <Button @click="cancelCreate" variant="outline">Cancelar</Button>
              </div>
            </div>
          </div>
          
          <!-- Edit Form -->
          <div v-if="isEditing" class="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-4">
            <h3 class="text-lg leading-6 font-medium text-dark-gray mb-4">Editar Categoria</h3>
            <div class="space-y-4">
              <Input
                v-model="editCategoryName"
                label="Nome da Categoria"
                placeholder="Digite o nome da categoria"
                required
              />
              <div class="flex space-x-2">
                <Button @click="updateCategory" variant="primary">Atualizar</Button>
                <Button @click="cancelEdit" variant="outline">Cancelar</Button>
              </div>
            </div>
          </div>
          
          <!-- Categories List -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul class="divide-y divide-gray-200">
              <li v-if="categoryStore.allCategories.length === 0" class="px-4 py-4 sm:px-6 text-center text-gray-500">
                Nenhuma categoria encontrada.
              </li>
              <li 
                v-for="category in categoryStore.allCategories" 
                :key="category.id" 
                class="px-4 py-4 sm:px-6 hover:bg-gray-50"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div>
                      <p class="text-sm font-medium text-primary-red cursor-pointer" @click="viewCategoryRecipes(category.id)">
                        {{ category.nome }}
                      </p>
                    </div>
                  </div>
                  <div v-if="authStore.isLoggedIn" class="flex space-x-2">
                    <Button @click="showEditForm(category.id, category.nome)" variant="secondary" size="sm">Editar</Button>
                    <Button @click="confirmDeleteCategory(category.id)" variant="danger" size="sm">Excluir</Button>
                  </div>
                  <Button v-else @click="viewCategoryRecipes(category.id)" variant="outline" size="sm">Ver Receitas</Button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>