<script setup lang="ts">
import InputOTP from "@/components/vin/input-otp.vue";

</script>

<template>
  <div style="display: grid; gap: 16px">
    <InputOTP label="Code" :length="6" :groups="[3, 3]" default-value="482193" error="That code has expired. Request a new one." />
    <InputOTP label="Backup PIN" :length="4" default-value="1234" disabled />
  </div>
</template>
