<script setup lang="ts">
import { useRegionApi } from '~/composables/api/region';

definePageMeta({
  middleware: async (to) => {
    const code = String(to.params.code ?? '');
    const { getCharacterDetail } = useRegionApi();
    const character = await getCharacterDetail(encodeURIComponent(code)).catch(() => null);
    if (!character?.region_code) {
      return abortNavigation(
        createError({ statusCode: 404, statusMessage: 'Character not found' })
      );
    }

    return navigateTo(
      {
        name: 'character-id',
        params: { id: character.region_code },
        query: { character: character.code || String(character.id) }
      },
      { replace: true }
    );
  }
});
</script>

<template>
  <div />
</template>
