<script setup lang="ts">
import NativeSelect from "@/components/vin/native-select.vue";

</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%; max-width: 320px">
    <NativeSelect label="Role" error="Pick a role to continue.">
      <option value="">Choose a role</option>
      <option>Admin</option>
      <option>Editor</option>
    </NativeSelect>
    <NativeSelect label="Region" disabled><option>Mumbai</option></NativeSelect>
  </div>
</template>
