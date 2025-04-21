<style scoped>
 *{
    font-size:16px;
    font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
  }

  .registForm{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    margin: 20px auto;
  }

  .row {
    margin-bottom: 15px;
    text-align: left;
  }

  .divsForm {
    width: 400px;
  }

  .row > label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #555;
    font-weight: bold;
  }

  .input {
    width: 200px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s ease;
  }

  input:focus {
    border-color: #1f38af;
  }

  input[type = date] {
    width: 200px;
  }

  .registBtn {
    width: 200px;
    height: 30px;
    border: none;
    border-radius: 10px;
    background-color: #ff8000;
    text-align: center;
    cursor: pointer;
    margin: 0 0 30px;
  }

  .rowBtns{
    display: flex;
    justify-content:space-evenly;
  }

  .simpleBtn.active {
    background-color: #1f38af;
    color: #fff;
  } 
  
  .simpleBtn:hover {
    background-color: #6b81e4;
    color: #fff;
  }
  
  .simpleBtn {    
    background-color: #e0e0e0;
    border: none;
    border-radius: 20px;
    padding: 10px 10px;
    margin: 0 5px;
    cursor: pointer;
    color: #333;
    font-weight: bold;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .focus {
    background-color: #1f38af;
    color: white;
    border: none;
  }

  .form {
    width: 500px;
    margin: 50px auto 0 auto;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .row:first-child {
    margin-top: 20px;
  }

  .submit-btn {
    padding: 10px 30px;
    background-color: #ff8000;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .submit-btn:hover {
    background-color: #e67800;
  }

 .popup-close {
   position: relative;
   top: -130px;
   right: -430px;
   width: 28px;
   height: 28px;
   z-index: 1000;
   cursor: pointer;
   background: url(/images/icon-close.svg) center no-repeat;
 }
</style>

<template>
    <section class = "form">
      <h1 style="margin: 0 0 10px; font-size:28px;">
        Личный кабинет
      </h1>
      <form class = "registForm" @submit.prevent="handleLogin">
    <div class = "divsForm">
      <div class="row rowBtns">
        <button class = "simpleBtn" type = "button" :class = "{focus: selectedBtn === 'reg'}"
        @click = "$router.push('/registration')"
        >Регистрация</button>
        <button class = "simpleBtn" type = "button" :class = "{focus: selectedBtn === 'auth'}"
          >Вход</button>
      </div>
      <div class="popup-close" @click="$router.push('/')" />
      <div class="row"><label for="email">Email<input type="email" name="email" class = "input" v-model="email"></label></div>
      <div class="row"><label for="password">Пароль<input type="password" name="password" class = "input" v-model="password"></label></div>
      <div class="row"><label for=""><a href="">Забыли пароль?</a></label></div>
      <button class="submit-btn" >Войти</button>
    </div>
      </form>
</section>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
import router from "@/router/index.js";

export default {
  name: 'Autarization',

  setup() {
    const selectedBtn = ref('auth');
    const isCategory = ref(false);
    const email = ref('');
    const password = ref('');

    const handleLogin = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/login', {
          email: email.value,
          password: password.value,
        },
        {
          withCredentials: true
        });

        if (response.data.success) {
          if (response.data.user.roles_id === 4){
            await router.push('/admin');
          }else {
            await router.push('/');
          }
        }
      } catch (e) {
        if (e.response && e.response.status === 401) {
          alert('Неверный email или пароль');
        }else {
          alert('Ошибка при входе');
        }
      }
    };
    return {
      selectedBtn,
      isCategory,
      email,
      password,
      handleLogin,
    }
  }
}
</script>