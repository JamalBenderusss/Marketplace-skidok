<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

export default {
  name: 'AddCategory',
  emits: ['close'],
  props: {
    categoryData: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'add', // 'add' или 'edit'
      validator: value => ['add', 'edit'].includes(value)
    }
  },
  setup(props, { emit }) {
    const category = ref('');
    const errors = ref({});

    const loadCategories = async () => {
        // Если режим редактирования и есть данные для редактирования
        if (props.mode === 'edit' && props.categoryData) {
          // Добавляем проверку, что categoryData не пустой объект
          if (Object.keys(props.categoryData).length > 0) {
            category.value = props.categoryData.name;
          }
        }
    }

    // Валидация формы
    const validateForm = () => {
      errors.value = {};

      if (!category.value) errors.value.title = 'Введите название категории';

      return Object.keys(errors.value).length === 0;
    };

    const saveCategory = async () => {
        if (!validateForm()) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      let response;

      try {
        if (props.mode === 'add') {
            response = await axios.post('http://localhost:3000/api/addCategory', { name: category.value });
        }else {
            response = await axios.put('http://localhost:3000/api/editCategory', { id: props.categoryData.category_id, name: category.value }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        if (response.data.success) {
            alert(props.mode === 'add' ? 'Категория успешно добавлена!' : 'Категория успешно обновлена!');
            location.reload();
        }
      } catch (error) {
        console.error('Не удалось добавить категорию:', error);
      }
    };

    const close = () => {
        category.value = '';
        errors.value = {};
        emit('close');
    };

    // Добавляем watch для отслеживания открытия формы
    watch(() => props.categoryData, (newVal) => {
      if (newVal) {
        loadCategories();
      }
    }, { immediate: true });

    return {
        category,
        errors,
        validateForm,
        saveCategory,
        close,
    }
  }
}
</script>


<template>
      <div class = "modal" @click.self="close">
    <div class="popup-close" @click="close"></div>
    <div class = overlay>
      <div class="column">
      <div class="row">
        <label>
          Категория
        </label>
        <input type="text" placeholder="Еда" v-model="category" :class = "{ error: errors.title}">
        <small class="error-text" v-if="errors.title">{{ errors.title }}</small>
      </div>
      <button @click="saveCategory" >
        Сохранить
        </button>
      </div>
      </div>
      </div>
</template>

<style scoped>
.modal {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.active {
  display: flex;
}

.overlay {
  width: 500px;
  height: 150px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: -5px 5px 5px rgba(0, 0, 0, 0.2);
  text-align: left;
  display: flex;
  justify-content: space-around;
  padding: 20px;
  overflow-y: auto;
}

.popup-close {
  position: relative;
  top: -65px;
  right: -525px;
  width: 28px;
  height: 28px;
  z-index: 1000;
  cursor: pointer;
  background: url(/images/icon-close.svg) center no-repeat;
}

.row {
  display: flex;
  flex-direction: column;
  width: 350px;
  margin: 10px auto;
}

.column {
  height: 90%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

input{
  border-radius: 5px;
  padding: 5px;
  border: 1px solid #ddd;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #1f38af;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #1f38af;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #152a8f;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

small {
  color: #666;
  font-size: 0.8em;
  margin-top: 2px;
}

.error {
  border-color: #ff4444 !important;
}

.error-text {
  color: #ff4444;
  font-size: 0.8em;
  margin-top: 4px;
}
</style>