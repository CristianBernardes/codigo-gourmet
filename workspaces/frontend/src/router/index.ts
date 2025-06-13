import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { authService } from '../services/authService';

// Define routes
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/recipes'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/auth/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes',
    name: 'Recipes',
    component: () => import('../views/recipes/RecipeListView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/recipes/create',
    name: 'CreateRecipe',
    component: () => import('../views/recipes/RecipeFormView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes/:id',
    name: 'RecipeDetail',
    component: () => import('../views/recipes/RecipeDetailView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/recipes/:id/edit',
    name: 'EditRecipe',
    component: () => import('../views/recipes/RecipeFormView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/categories/CategoryListView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/categories/:id',
    name: 'CategoryDetail',
    component: () => import('../views/categories/CategoryDetailView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/my-recipes',
    name: 'MyRecipes',
    component: () => import('../views/recipes/MyRecipesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { requiresAuth: false }
  }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.meta.requiresAuth as boolean;
  const guestOnly = to.meta.guestOnly as boolean;

  // Redirect authenticated users away from guest-only routes
  if (guestOnly && isAuthenticated) {
    return next('/recipes');
  }

  // Redirect unauthenticated users to login
  if (requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  next();
});

export default router;
