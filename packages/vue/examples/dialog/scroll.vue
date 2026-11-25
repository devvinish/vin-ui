<script setup lang="ts">
import Dialog, { DialogClose } from "@/components/vin/dialog.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <Dialog title="Terms of use">
    <template #trigger><Button variant="outline">Read the terms</Button></template>
    <p>VinUI is free and MIT licensed. You can use it in personal and commercial work, change it, and ship it in your own products.</p>
    <p>Keep the licence notice in copies of the source. You don't need to credit VinUI in your app, though a link is always welcome.</p>
    <p>The components come as they are, without a warranty. Test them in your own product before you ship.</p>
    <p>Fonts and icons used in the examples have their own licences. Check them before you use them.</p>
    <p>When the content is longer than the screen, the dialog scrolls inside and the page behind it stays put.</p>
    <template #footer>
      <DialogClose><Button variant="outline">Decline</Button></DialogClose>
      <DialogClose><Button>Accept</Button></DialogClose>
    </template>
  </Dialog>
</template>
