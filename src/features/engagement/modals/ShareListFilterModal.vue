
<script setup lang="ts">
import { watch } from 'vue'

import { useRouter } from 'vue-router'
import { useShareListFilterStore } from '../stores/ShareListFilterStore'
import { useModalStore } from '@/stores/modalStore'
import { GeneralSortTypeSelectItems, LimitedContentTypeSelectItems, ContactTypeSelectItems } from '@/utils/selectItemHelper'

const router = useRouter()
const filterStore = useShareListFilterStore()
const modalStore = useModalStore()

function applyFilter() {
  // 🔗 Vue Router handles translating the filter state straight to the browser url parameters footprint
  router.push({
    path: router.currentRoute.value.path,
    query: filterStore.getAsDictionary() // Generates a clean object removing all "-1" or null entries
  })

  // Dismiss modal window from presentation tree tracking index safely
  modalStore.pop()
}

watch(() => filterStore.scope, (newScope, oldScope) => {
  console.log('Scope changed from', oldScope, 'to', newScope)

  if (newScope === '') {
    filterStore.startdate = '';
    filterStore.enddate = '';
  } else if (newScope === 'On') {
    // 🎯 Clear it! The UI shouldn't hold or display an end date for "On" mode
    filterStore.enddate = ''; 
  } else if (newScope === 'From') {
    filterStore.enddate = ''; 
  } else if (newScope === 'Until') {
    filterStore.startdate = ''; 
  }
})

</script>

<template>

  <div class="form-container">

    <form @submit.prevent="applyFilter">
      
      <!-- 1. Text Searching Content Inputs -->
      <section>
        <h3 class="form-heading">Search</h3>
       
         <fieldset>
          <input 
            v-model="filterStore.username" 
            type="text" 
            id="Username" 
            class="form-field" 
            placeholder="-- enter username --" 
          />
        </fieldset>
      </section>

   <!-- 2. Dataset Result Record Filtering Parameters -->
      <section>
        <h3 class="form-heading">Filter</h3>

         <fieldset>
                <select v-model="filterStore.contenttype"  class="form-field">
                    <option value="-1">-- by content type --</option>
                    <option v-for="item in LimitedContentTypeSelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>
             <fieldset>
                <select v-model="filterStore.contact"  class="form-field">
                    <option value="-1">-- by contact type --</option>
                    <option v-for="item in ContactTypeSelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>
        <fieldset>
          <div class="ticks">
             <p>
              <input 
                type="radio" 
                id="On" 
                value="On" 
                name="scope" 
                v-model="filterStore.scope"
              />
              <label for="On">On Start Date</label>
            </p>
            <p>
              <input 
                type="radio" 
                id="From" 
                value="From" 
                name="scope" 
                v-model="filterStore.scope"
              />
              <label for="From">From Start Date</label>
            </p>

            <p>
              <input 
                type="radio" 
                id="To" 
                value="Until" 
                name="scope" 
                v-model="filterStore.scope"
              />
              <label for="To">Until End Date</label>
            </p>

            <p>
              <input 
                type="radio" 
                id="Between" 
                value="Between" 
                name="scope" 
                v-model="filterStore.scope"
              />
              <label for="Between">Between Start & End date</label>
            </p>
          </div>
        </fieldset>

            <template v-if="filterStore.scope === 'On' || filterStore.scope === 'From' || filterStore.scope === 'Between'">

                  <fieldset>
          <div class="ticks date">
            <label for="StartDate">Start Date</label>
            <input 
              type="date"
              id="StartDate"
              v-model="filterStore.startdate"
              class="outscribed-input" 
            />
          </div>
        </fieldset>
            </template>

            <template v-if="filterStore.scope === 'Until' || filterStore.scope === 'Between'">
   <fieldset>
          <div class="ticks date">
            <label for="EndDate">End Date</label>
            <input 
              type="date"
              id="EndDate"
              v-model="filterStore.enddate"
              class="outscribed-input" 
            />
          </div>
        </fieldset>
            </template>

        <fieldset>
          <div class="ticks">
            <p>
              <input 
                type="checkbox" 
                id="BypassCache" 
                v-model="filterStore.bypasscache" 
              />
              <label for="BypassCache">Bypass Cache</label>
            </p>
          </div>
        </fieldset>
      </section>


      <!-- 4. Dataset Result Record Ordering Parameters -->
      <section>
        <h3 class="form-heading">Order</h3>
        <fieldset>
                <select v-model="filterStore.sort"  class="form-field">
                    <option value="-1">-- sort by --</option>
                    <option v-for="item in GeneralSortTypeSelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>
      </section>

      <!-- 5. Form Actions Layout Triggers -->
      <div class="filter-buttons">
        <button type="button" @click="filterStore.reset()" class="btn primary">Reset</button>
        <button type="submit" class="btn secondary">Filter</button>
      </div>

    </form>
  </div>
</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>