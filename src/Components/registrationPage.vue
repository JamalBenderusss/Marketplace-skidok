<style scoped>
 .form__title {
   margin: 0 0 10px;
   font-size:28px;
 }

 .form__registration{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    margin: auto;
  }

  .row {
    margin-bottom: 15px;
    text-align: left;
  }

  .form__divsForm {
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

  .form__rowBtns{
    display: flex;
    justify-content:space-evenly;
  }

  .simpleBtn:active {
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
    padding: 10px;
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
   top: -120px;
   right: -430px;
   width: 28px;
   height: 28px;
   z-index: 1000;
   cursor: pointer;
   background: url(/images/icon-close.svg) center no-repeat;
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

 @media screen and (max-width: 576px) {
  .form__title {
    font-size: 0.9rem;
  }

  .form {
    width: 200px;
  }

  .form__divsForm {
    width: 200px;
  }

  .simpleBtn {
    padding: 5px;
    font-size: 0.6rem;
  } 

  label {
    font-size: 0.7rem;  
  }

  .input {
    width: 90px;
    padding: 5px;
    font-size: 0.7rem;
  }

  .submit-btn {
    padding: 5px;
    font-size: 0.7rem;
  }

  .error-text {
    font-size: 0.5rem;
    margin-top: 2px;
  }

  .popup-close {
    top: -90px;
    right: -195px;
    width: 20px;
    height: 20px;
  }
 }
</style>

<template>
    <section class = "form">
      <h1 class = "form__title">
        Регистрация
      </h1>
      <form class = "form__registration" @submit.prevent="registrateUser">
        <div class = "form__divsForm">
          <div class="row form__rowBtns">
            <button class = "simpleBtn" type = "button" :class = "{focus: selectedBtn === 'reg'}">Регистрация</button>
            <button class = "simpleBtn" type = "button" :class = "{focus: selectedBtn === 'auth'}" @click = "$router.push('/autarization')">Вход</button>
          </div>
        <div class="popup-close" @click="$router.push('/')" ></div>
        <div class="row"><label for="name">Имя<input type="text" name="name" class = "input" v-model="name" :class = "{ error : errors.name }"></label>
          <small class="error-text" v-if = "errors.name"> {{ errors.name }}</small>
        </div>
        <div class="row"><label for="lastname">Фамилия<input type="text" name="lastname" class = "input" v-model="lastname" :class = "{ error : errors.lastname }"></label>
          <small class="error-text" v-if = "errors.lastname"> {{ errors.lastname }}</small>
        </div>
        <div class="row"><label for="email">Email<input type="email" name="email" class = "input" v-model="email" :class = "{ error : errors.email }"></label>
          <small class="error-text" v-if = "errors.email"> {{ errors.email }}</small>
        </div>
        <div class="row"><label for="birthday">Дата рождения<input type="date" name="birthday" class = "input" v-model="birthday" :class = "{ error : errors.birthday }"></label>
          <small class="error-text" v-if = "errors.birthday"> {{ errors.birthday }}</small>
        </div>
        <div class="row"><label for="password">Пароль<input type="password" name="password" class = "input" v-model="password" :class = "{ error : errors.password }"></label>
          <small class="error-text" v-if = "errors.password"> {{ errors.password }}</small>
        </div>
        <div class="row"><label for="confirm-password">Подтвердите пароль<input type="password" name="confirm-password" class = "input" v-model="repassword" :class = "{ error : errors.repassword }"></label>
          <small class="error-text" v-if = "errors.repassword"> {{ errors.repassword }}</small>
        </div>
        <button class="submit-btn">Зарегистрироваться</button>
    </div>
  </form>
</section>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';

export default {
  setup() {
    const selectedBtn = ref('reg');
    const name = ref('');
    const lastname = ref('');
    const email = ref('');
    const birthday = ref('');
    const password = ref('');
    const repassword = ref('');
    const errors = ref({});

    const validate = () => {
      errors.value = {};

      const currentDate = new Date();
      const birthdate = new Date(birthday.value);

      if (!name.value) errors.value.name = 'Заполните поле';
      if (!lastname.value) errors.value.lastname = 'Заполните поле';
      if (!email.value) errors.value.email = 'Заполните поле';
      if (!password.value) errors.value.password = 'Заполните поле';
      if (!repassword.value) errors.value.repassword = 'Заполните поле';
      if (repassword.value !== password.value) errors.value.password = 'Пароли не одинаковые';
      if (currentDate <= birthdate) errors.value.birthday = 'Дата рождения не может быть в будущем';

      return Object.keys(errors.value).length === 0;
    }

    const registrateUser = async() => {
      if (!validate()) {
        alert('Заполните все поля!');
        return;
      }

      const userData = {
        name: name.value + ' ' + lastname.value,
        email: email.value,
        password: password.value,
        birthday: birthday.value,
      };

      try {
        const response = await axios.post('http://62.217.178.172:3000/api/registration', userData, {
        withCredentials: true
        });
        if (response.data.success) {
            await router.push('/autarization');}
      }
      catch(e) {      
        if (e.response) {
          alert(e.response.data.message || 'Ошибка при регистрации');
        } else {
          alert('Вы успешно зарегистрировались! Проверьте email.'); 
        }
      }
    }

    return {
      selectedBtn,
      name,
      lastname,
      email,
      birthday,
      password,
      repassword,
      errors,
      validate,
      registrateUser,
    }
  }

}

</script>