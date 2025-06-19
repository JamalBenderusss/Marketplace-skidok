<style scoped>
  .form__registForm{
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
    margin-top: 20px;
    text-align: center;
    margin: auto;
  }

  .row {
    margin-bottom: 15px;
    text-align: left;
    width: 100%;
  }

  label {
    color: #555;
    font-size: 18px;
    font-weight: bold;
  }

  .form__registForm {
    max-width: 800px;
    max-height: 500px;
    margin: 0 auto;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .menu {
    width: 35%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  }

  .divsForm {
    display: flex;
    width: 60%;
    flex-wrap: wrap;
    min-height: 200px;
  }

  .user {
    width: 100%;
    height: 45px;
    border:#6b81e4 1px solid;
    margin-bottom: 10px;
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .profile {
    background-color: #6b81e4;  
  }

  .container {
    height: 100vh;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }

  .container__title {
    margin: 0 0 30px;
    font-size: 28px;
    text-align: center;
  }

  .info {
    font-weight: 500;   
    color: #555;
    font-size: 16px;
  }

  input:focus {
    border-color:#1f38af;
  }

input {
  height: 25px;
  border: 1px solid #ddd;
  width: 240px;
  border-radius: 10px;
  padding: 0 5px;
  margin-left: 15px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s ease;
}

.submit-btn {
  padding: 10px 30px;
  border-radius: 10px;
  border: none;   
  transition: background-color 0.5s ease;
}

.submit-btn:hover {
  background-color: #6b81e4;  
}

@media screen and (max-width: 576px) {

  .form__registForm {
    max-width: 250px;
    max-height: 500px;
    margin: 0 auto;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 15px;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .container__title {
    font-size: 0.9rem;
  }

  label {
    font-size: 0.7rem;
  }

  .info {
    font-size: 0.75rem;
  }

  .menu {
    width: 50px;
    margin-right: 15px;
  }

  input {
    width: 100%;
    font-size: 0.6rem;
  }

  .submit-btn {
    padding: 5px;
    font-size: 0.9rem;
  }
  
  }
</style>

<template>
  <div class="container">
      <h1 class="container__title">
        Личный кабинет
      </h1>
      <section class = "container__form form">
        <div class = "form__registForm">
          <profileNav :active-tab="activeTab" @change-tab="changeTab" />
        <div class = "divsForm" v-if="activeTab === 'profile'">
          <div class="row"><label for="email">Email: </label><label for="email" class = "info">{{ email }}</label></div>
          <div class="row"><label for="name">Имя: </label><label for="name" class = "info">{{ name }}</label></div>
          <div class="row"><label for="role">Роль: </label><label for="name" class = "info">{{ role }}</label></div>
          <div class="row"><label for="birthdate">Дата рождения: </label><label for="birthdate" class = "info">{{ formatedDate(birthdate) }}</label></div>
        </div>
        <div class = "divsForm" v-else-if="activeTab === 'editing'">
          <div class="row"><label for="email">Email: </label><input type="email" name="email" class = "input" v-model="email"></div>
          <div class="row"><label for="name">Имя: </label><input type="text" name="name" class = "input" v-model="name"></div>
          <div class="row"><label for="role">Роль: </label><label for="name" class = "info">{{ role }}</label></div>
          <div class="row"><label for="birthdate">Дата рождения: </label><input type="date" name="birthdate" class = "input" v-model="birthdate"></div>
          <button class="submit-btn" @click="updateUserData">Обновить данные</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import profileNav from './profileNav.vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  components: {profileNav},
  name: 'ProfilePage',

  setup() {
    const activeTab = ref('profile');
    const name = ref('');
    const email = ref('');
    const role = ref('');
    const birthdate = ref('');

    const showUserData = async() => {
      try {
        const response = await axios.get('http://62.217.178.172:3000/profile/me', { withCredentials: true });
        const userData = response.data;
        name.value = userData.name;
        email.value = userData.email;
        role.value = userData.role;
        birthdate.value = userData.date_of_birth;
     } catch (error) {
      console.error('Полная ошибка:', error);
      console.error('Ответ сервера:', error.response?.data);
     };
  };

  const formatedDate = (a) => {
    const date = new Date(a);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const updateUserData = async() => {
    try {
    const tokenResponse = await axios.get('http://62.217.178.172:3000/token', { 
      withCredentials: true 
    });
    
    const userId = tokenResponse.data.id;

    const response = await axios.patch(`http://62.217.178.172:3000/profile/change/${userId}`,{
      email: email.value,
      name: name.value,
      date_of_birth: birthdate.value || '',
    },{ withCredentials: true }
  );

    if (response.data.success) {
      alert('Данные успешно обновлены');
      await showUserData();
      activeTab.value = 'profile';
    };
  } catch (error) {
    console.error('Ошибка при обновлении:', error);
    alert(error.response?.data?.message || 'Ошибка при обновлении данных');
  }
  };

    const changeTab = (tab) => {
      activeTab.value = tab;
    }

    onMounted(showUserData);

    return {
      activeTab,
      name,
      email,
      role,
      birthdate,
      formatedDate,
      updateUserData,
      changeTab,
      showUserData,
    }
  }
}

</script>