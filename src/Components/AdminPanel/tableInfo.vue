<style scoped>  
  td {
    font-size: 12px;
    max-width: 160px;
    white-space: normal;
  }

  .div-table {
    /* width: 85%;
    max-height: 100vh;
    text-align: left; */
    margin: auto;
    width: 100%;
    height: 100%;
    padding: 15px;
    background-color: #f1f5f9;
    overflow-y: auto;

  }

  .div-table__data-table {
    /*
     display: flex;
    width: 100%;
    height: 100vh;
    border-collapse: collapse;
    font-size: 14px;
    border: none;
    flex-wrap: wrap;
    table-layout: fixed;
    box-sizing: border-box;
    overflow-x: hidden; 
    text-align: center; */ 
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    color: #1f2937;
  }

  .div-table__table-container {
    background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 12px;
  max-width: 100%;
  text-align: left;
  margin: 0 auto;
  overflow-x: auto;
  }

  td:has( > b) {
    font-weight: bold;
	  padding: 5px;
	  background: #efefef;
	  border: 1px solid #dddddd;
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
  }

  tbody  td {
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
    padding: 5px;
    height: auto;
    vertical-align: top;
  }

  tr:nth-child(odd){
	background: #fff;
  }

  tr:nth-child(even){
	background: #F7F7F7;
  }

  tr td:last-child {
    border-right: none;
  }

  tr td:first-child {
    border-left: none;
  }

  b {
    font-size: 12px;
  }

  button {
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  transition: all 0.3s ease;
  font-size: 13px;
  }

  .data-table__submit-btn {
    border-radius: 10px;
    width: 30px;
    height: 20px;
    padding: 5px 20px 5px 5px;
    background-color: rgb(240, 240, 240);
  }

  .edit {
    background-image: url('/icons/edit.png');
    background-size: 16px;
    background-repeat: no-repeat;
    background-position-x: center;
    background-position-y: center;
    background-color: transparent;
    cursor: pointer;
    border-radius: 6px;
  }

  .delete {
    background-image: url('/icons/delete.png');
    background-size: 17px;
    background-repeat: no-repeat;
    background-position-x: center;
    background-position-y: center;
    background-color: transparent;
    cursor: pointer;
    border-radius: 6px;
  }

  .edit:hover {
    background-color: #6b81e4;  
    transform: translateY(1px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }

  .delete:hover {
    background-color: #e46b6b;  
    transform: translateY(1px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }

  .div-table__add {
    margin: 10px 10px 10px 0;
    border-radius: 10px;
    text-align: center;
    padding: 5px 20px 5px 20px;
    border: none;   
    background-color: #46e61e;
  }

  .div-table__add:hover {
    background-color: #30f505;
    transform: translateY(1px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }

  .small {
    font-size: 10px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }
</style>

<template>
<div class="div-table">
  <div class="div-table__table-container">
  <button class="div-table__add" @click="emitAdd" title="Добавить строку" v-if="!hideAddButton">Добавить</button>
  <table class="div-table__data-table">
      <tbody>  
        <tr>
          <td v-for="column in columns" :key="column.id">
            <b>
              {{ column }}
            </b>
          </td>
          <td>
            <b>
              Действия
            </b>
          </td>
        </tr>
        <tr v-for="items in data" :key="items.id">
          <td v-for="(value, key) in items" :key="key" :class="formatedDate(value).length > 30 ? 'small' : ''">
            {{ formatedDate(value) }} 
          </td>
          <td class="action-buttons" v-if="!isPromoTable || (StoreId === items.Stores_id || !StoreId || StoreId === items.Store_id )">
            <button @click="editRow(items)" class="data-table__submit-btn edit" title="Редактировать данные">
            </button>
            <button @click="deleteRow(items)" class="data-table__submit-btn delete" title="Удалить строку">
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios'

export default {
    name: 'tableInfo',
    props: {
        data: {
          type: Array,
          required: true
        },
        columns: {
          type: Array,
          required: true
        },
        hideAddButton: {
          type: Boolean,
          default: false
        },
        isPromoTable: {
          type: Boolean,
          default: false
        }
    },
    emits: ['delete-row', 'edit-row', 'emit-add'],
    setup(props, {emit}) {
      const StoreId = ref(''); 
      const columns = ref(props.columns);

      const emitAdd = () => {
        emit('emit-add');
      };

      const editRow = (item) => {
        emit('edit-row', item);
      }

      const deleteRow = (item) => {
        if(confirm('Вы уверены что хотите удалить запись?')){
          emit('delete-row', item);
        }else{
          return ;
        }
      };

      const checkUserRole = async () => {
      try{
        const response1 = await axios.get('http://localhost:3000/token', { withCredentials: true });
        const userData = response1.data;
        if (userData.roles_id === 5) {
          const response = await axios.get('http://localhost:3000/getManagerStore', {
            params: {
              id: userData.id
            }
          });
          StoreId.value = response.data.id;
        }
      }
      catch(e){
        console.error('Ошибка', e.message);
      }
    };

      const formatedDate = (a) => {
        if (a === null || a === undefined) return 'Нет данных';
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(a)) {
        const date = new Date(a);
        return date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
      })
      } else {
        return a;
      }
      };

      onMounted(checkUserRole);

      watch(() => props.columns, (newColumns) => {
        columns.value = newColumns;
      }, { immediate: true });

      return {
        StoreId,
        data: props.data,
        columns,
        formatedDate,
        deleteRow,
        emitAdd,
        editRow,
      }
    }
}
</script>