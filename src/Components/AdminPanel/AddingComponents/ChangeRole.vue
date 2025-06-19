<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

export default {
  name: 'ChangeRole',
  emits: ['close'],
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  setup(props, { emit }) {
    const roles_id = ref('');
    const selectedStore = ref('');
    const stores = ref([]);
    const errors = ref({});

    const loadCategories = async () => {
      const [storesRes] = await Promise.all([
        axios.get('http://62.217.178.172:3000/api/Stores')
      ]);
      stores.value = storesRes.data;
          // Добавляем проверку, что categoryData не пустой объект
          if (Object.keys(props.user).length > 0) {
            roles_id.value = props.user.roles_id.toString();
          }
    }

    // Валидация формы
    const validateForm = () => {
      errors.value = {};

      if (!roles_id.value) errors.value.title = 'Введите действительную роль';
      
      if (roles_id.value === '5' && !selectedStore.value) {
        errors.value.store = 'Выберите магазин для менеджера';
      }

      return Object.keys(errors.value).length === 0;
    };

    const saveCategory = async () => {
        if (!validateForm()) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      let response;

      try {
        if (roles_id.value === '5') {
            response = await axios.put('http://62.217.178.172:3000/api/setStoreOfManager', { id: props.user.user_id, role: roles_id.value, store: selectedStore.value}, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });          
        } else {
            response = await axios.put('http://62.217.178.172:3000/api/changeRole', { id: props.user.user_id, role: roles_id.value}, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        if (response.data.success) {
            alert('Роль успешно изменена!');
            location.reload();
        }
      } catch (error) {
        alert('Ошибка при изменении роли');
        console.error('Не удалось изменить роль:', error);
      }
    };

    const close = () => {
        roles_id.value = '';
        selectedStore.value = '';
        errors.value = {};
        emit('close');
    };

    // Добавляем watch для отслеживания открытия формы
    watch(() => props.user, (newVal) => {
      if (newVal) {
        loadCategories();
      }
    }, { immediate: true });

    return {
        roles_id,
        selectedStore,
        stores,
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
        <label class="icon" title="
3 - Пользователь 
4 - Админ
5 - Менеджер">
          Роль 
        </label>
        <select v-model="roles_id" :class = "{ error: errors.title}">
          <option value="">Выберите роль</option>
          <option value="3">Пользователь</option>
          <option value="4">Администратор</option>
          <option value="5">Менеджер</option>
        </select>
        <small class="error-text" v-if="errors.title">{{ errors.title }}</small>
      </div>
      <div class="row" v-if="roles_id === '5'">
      <label>
         Магазин
      </label>
        <select v-model="selectedStore" required :class = "{ error: errors.store }"  size="3" 
          style="overflow-y: auto;" >
          <option value="">Выберите магазин</option>
          <option
            v-for="store in stores"
              :key="store.Store_id"
              :value="store.Store_id"
            >
              {{ store.name }}
          </option>
        </select>
        <small class="error-text" v-if="errors.store">{{ errors.store }}</small>
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

.icon {
    background-image: url('/icons/information.png');
  background-repeat: no-repeat;
  background-position: right center;
  background-size: 20px;
  height: 20px;
  width: 60px;
  margin-bottom: 10px;
}

select {
  border-radius: 5px;
  padding: 5px;
  border: 1px solid #ddd;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s ease;
  appearance: none;  
  box-shadow: none;               /* убирает тень */
  background: white;              /* фон */
  padding-right: 30px;
}

select:hover {
  outline: none;
  box-shadow: none;
  border-color: #1f38af;
}

select:focus {
  border-color: #1f38af;
}

.overlay {
  width: 500px;
  height: 270px;
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
  top: -125px;
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