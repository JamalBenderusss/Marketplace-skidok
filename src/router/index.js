import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '@/Components/mainPage.vue';
import RegistrationPage from '@/Components/registrationPage.vue';
import autarizationPage from '@/Components/autarization.vue';
import categoryPage from '@/Components/categoryPage.vue';
import ProfilePage from '@/Components/ProfilePage/Profile.vue';
import adminPage from '@/Components/AdminPanel/adminPage.vue';
import AddPromo from "@/Components/AdminPanel/AddingComponents/AddPromo.vue";


const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage,
  },
  {
    path: '/registration',
    name: 'RegistrationPage',
    component: RegistrationPage
  },
  {
    path: '/autarization',
    name: 'autarizationPage',
    component: autarizationPage
  },
  {
    path: '/category/:id',
    name: 'categoryPage',
    component: categoryPage
  },
  {
    path: '/user/profile',
    name: 'ProfilePage',
    component: ProfilePage
  },

  {
    path: '/admin',
    name: 'adminPage',
    component: adminPage
  },
  {
    path: '/AddPromo',
    name: 'AddPromo',
    component: AddPromo
  },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
