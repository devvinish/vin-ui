<script lang="ts">
  import InputOTP from "@/components/vin/input-otp.svelte";
</script>

<InputOTP label="Verification code" length={6} groups={[3, 3]} hint="Sent by SMS to the number ending 4321." />
