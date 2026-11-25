<script lang="ts">
/*
 * VinUI · Breadcrumb (Vue). API: spec/breadcrumb.json.
 * items: top first. The last one is this page and gets aria-current="page".
 *   <Breadcrumb :items="[{ label: 'Home', href: '/' }, { label: 'Settings' }]" />
 */
import type { Component } from "vue";

export type BreadcrumbItem = { label: string; href?: string };
</script>

<script setup lang="ts">
withDefaults(defineProps<{
  items: BreadcrumbItem[];
  separator?: "slash" | "chevron";
  /** Render your router's link component (e.g. RouterLink) instead of <a>. It gets href. */
  linkAs?: string | Component;
}>(), { separator: "slash", linkAs: "a" });

// Long names are cut with "…"; keep the full name in the title.
const titleOf = (label: string) => (label.length > 22 ? label : undefined);
</script>

<template>
  <nav aria-label="Breadcrumb" :class="['vin-breadcrumb', separator === 'chevron' && 'vin-breadcrumb--chevron']">
    <ol class="vin-breadcrumb__list">
      <li v-for="(item, i) in items" :key="i" class="vin-breadcrumb__item">
        <span v-if="i === items.length - 1" class="vin-breadcrumb__page" aria-current="page" :title="titleOf(item.label)">{{ item.label }}</span>
        <component :is="linkAs" v-else class="vin-breadcrumb__link" :href="item.href" :title="titleOf(item.label)">{{ item.label }}</component>
      </li>
    </ol>
  </nav>
</template>
