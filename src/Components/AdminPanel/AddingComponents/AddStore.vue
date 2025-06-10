<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

export default {
  name: 'AddStore',
  emits: ['close'],
  props: {
    storeData: {
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
    const store = ref('');
    const description = ref('');
    const link = ref('');
    const contacts = ref('');
    const errors = ref({});

    const loadStore = async () => {
        // Если режим редактирования и есть данные для редактирования
        if (props.mode === 'edit' && props.storeData) {
            console.log(props.storeData.name);
          // Добавляем проверку, что categoryData не пустой объект
          if (Object.keys(props.storeData).length > 0) {
            store.value = props.storeData.name;
            description.value = props.storeData.description;
            link.value = props.storeData.link;
            contacts.value = props.storeData.contacts;
          }
        }
    }

    // Валидация формы
    const validateForm = () => {
      errors.value = {};

      if (!store.value) errors.value.title = 'Введите название магазина';
      if (!description.value) errors.value.description = 'Введите описание магазина';

      return Object.keys(errors.value).length === 0;
    };

    const saveStore = async () => {
        if (!validateForm()) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      let response;

      try {
        if (props.mode === 'add') {
            response = await axios.post('http://localhost:3000/api/addStore', { name: store.value, description: description.value, link: link.value, contacts: contacts.value });
        }else {
            response = await axios.put('http://localhost:3000/api/editStore', { id: props.storeData.Store_id, name: store.value, description: description.value, link: link.value, contacts: contacts.value }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        if (response.data.success) {
            alert(props.mode === 'add' ? 'Магазин успешно добавлен!' : 'Описание магазина успешно обновлено!');
            location.reload();
        }
      } catch (error) {
        console.error('Не удалось добавить магазин:', error);
      }
    };

    const close = () => {
        store.value = '';
        description.value = '';
        link.value = '';
        contacts.value = '';
        errors.value = {};
        emit('close');
    };

    // Добавляем watch для отслеживания открытия формы
    watch(() => props.storeData, (newVal) => {
      if (newVal) {
        loadStore();
      }
    }, { immediate: true });

    return {
        store,
        errors,
        contacts,
        link,
        description,
        validateForm,
        saveStore,
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
          Название Магазина
        </label>
        <input type="text" placeholder="Burger King" v-model="store" :class = "{ error: errors.title}">
        <small class="error-text" v-if="errors.title">{{ errors.title }}</small>
      </div>
      <div class="row">
        <label>
          Описание
        </label>
        <input type="text" placeholder="Лучший фастфуд в городе" v-model="description" :class = "{ error: errors.description}">
        <small class="error-text" v-if="errors.description">{{ errors.description }}</small>
      </div>
        <div class="row">
          <label>
            Ссылка
          </label>
          <input type="text" placeholder="https://burger-king.by" v-model="link">
        </div>
        <div class="row">
          <label>
            Контакты
          </label>
          <input type="text" placeholder="+375 (29) 123 45 67" v-model="contacts">
        </div>
      <button @click="saveStore">
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
  height: 350px;
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
  top: -170px;
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