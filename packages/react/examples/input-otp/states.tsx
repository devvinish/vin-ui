import { InputOTP } from "@/components/vin/input-otp";

export function InputOTPStates() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <InputOTP label="Code" length={6} groups={[3, 3]} defaultValue="482193" error="That code has expired. Request a new one." />
      <InputOTP label="Backup PIN" length={4} defaultValue="1234" disabled />
    </div>
  );
}
