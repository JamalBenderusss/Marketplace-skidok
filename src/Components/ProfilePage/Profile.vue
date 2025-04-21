<style scoped>
 *{
    font-size: 16px;
    font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
 }

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
          <div class="row"><label for="email">Email <input type="email" name="email" class = "input"></label></div>
          <div class="row"><label for=""><a href="">Забыли пароль?</a></label></div>
          <button class="submit-btn">Зарегистрироваться</button>
        </div>
        <div class="divsForm" v-else-if="activeTab === 'mainMenu'">
          <div class="row"><label for="email">Email <input type="email" name="email" class = "input"></label></div>
          <button class="submit-btn">Зарегистрироваться</button>
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
        const response = await axios.get('http://localhost:3000/profile/me', { withCredentials: true });
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

  const formatedDate = (a) =>{
      const date = new Date(a);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
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
      changeTab,
      formatedDate,
      showUserData,
    }
  }
}

</script>