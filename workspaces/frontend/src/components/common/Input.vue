<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string;
  type?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  id?: string;
  name?: string;
  autocomplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  label: '',
  placeholder: '',
  required: false,
  disabled: false,
  error: '',
  id: '',
  name: '',
  autocomplete: ''
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`);

const inputClasses = computed(() => {
  const baseClasses = 'block w-full rounded-md shadow-sm focus:ring-2 focus:ring-offset-0 sm:text-sm';
  const stateClasses = props.error
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-primary-red focus:ring-primary-red';
  const disabledClasses = props.disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  
  return `${baseClasses} ${stateClasses} ${disabledClasses}`;
});
</script>

<template>
  <div>
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-dark-gray mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :name="name"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :class="inputClasses"
        @input="updateValue"
      />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>