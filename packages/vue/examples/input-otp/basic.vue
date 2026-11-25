<script setup lang="ts">
import InputOTP from "@/components/vin/input-otp.vue";

</script>

<template>
  <InputOTP label="Verification code" :length="6" :groups="[3, 3]" hint="Sent by SMS to the number ending 4321." />
</template>
