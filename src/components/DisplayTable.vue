<script setup lang="ts" generic="TItem">
// Parameters matching your Blazor attributes
defineProps<{
  items: TItem[];
  // 🎯 Dynamic function that pulls the unique primitive ID from the item
  itemKey: (item: TItem) => string | number;
  isRowHighlighted?: (item: TItem) => boolean;
}>();

// Event callbacks
const emit = defineEmits<{
  (e: 'rowClick', item: TItem): void;
  (e: 'rowKeyDown', event: KeyboardEvent, item: TItem): void;
}>();
</script>

<template>
  <div class="table-container">
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <slot name="header" />
          </tr>
        </thead>
        
      <tbody>
          <tr
            v-for="item in items"
            :key="itemKey(item)" 
            :class="{ 'viewed': isRowHighlighted?.(item) }"
            role="button"
            tabindex="0"
            aria-label="View details"
            @click="emit('rowClick', item)"
            @keydown="(e) => emit('rowKeyDown', e, item)"
          >
            <slot name="row" :item="item" />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="less" scoped>
   @import "@/assets/css/table.less";
</style>