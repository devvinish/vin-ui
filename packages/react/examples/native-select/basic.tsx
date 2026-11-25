import { NativeSelect } from "@/components/vin/native-select";

export function NativeSelectBasic() {
  return (
    <NativeSelect label="Country" hint="Used for tax and currency." style={{ width: "100%", maxWidth: 320 }}>
      <option>India</option>
      <option>United Kingdom</option>
      <option>United States</option>
      <option>Germany</option>
    </NativeSelect>
  );
}
