<template>
	<AppNavigation />
	<RouterView />
	<AppFooter />
</template>

<script setup lang="ts">
import AppNavigation from '@/components/AppNavigation.vue';
import AppFooter from '@/components/AppFooter.vue';
</script>
