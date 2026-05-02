<script setup lang="ts">
import { Database } from "lucide-vue-next";
// import { HelpCircle } from "lucide-vue-next";

const runtimeConfig = useRuntimeConfig();

const discordInviteUrl = ref("");

const info = await $fetch(runtimeConfig.public.infoUrl);

// Check if info is object or JSON string and parse if needed
const infoData = typeof info === "string" ? safeJsonParse(info) : info;

if (infoData?.["discord-invite-url"]) {
  discordInviteUrl.value = infoData["discord-invite-url"];
}

// Safe JSON parser that won't throw errors
function safeJsonParse(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return ""; // Return empty string if parsing fails
  }
}
</script>

<template>
  <header class="border-solid sticky top-0 z-50 w-full border-b bg-background">
    <div class="p-2 md:p-4 flex items-center gap-2">
      <slot />

      <div class="flex ml-auto">
        <!-- <Button
          variant="ghost"
          size="icon"
          as-child
          class="hidden sm:inline-flex"
          :title="$t('howToUse.title')"
        >
          <NuxtLink to="/how-to-use">
            <HelpCircle class="w-5 h-5" />
          </NuxtLink>
        </Button> -->
        <Button
          variant="ghost"
          size="icon"
          as-child
          class="hidden sm:inline-flex"
          :title="$t('status.title')"
        >
          <NuxtLink to="/status">
            <Database class="w-5 h-5" />
          </NuxtLink>
        </Button>
        <AppLanguageSwitcher />
        <AppColorModeSwitcher />
        <Button
          variant="ghost"
          size="icon"
          as-child
          class="hidden sm:inline-flex"
        >
          <a
            href="https://github.com/lichingchester/hololive-ocg-wiki"
            target="_blank"
          >
            <IconGithub class="w-5 h-5" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          as-child
          class="hidden sm:inline-flex"
        >
          <a :href="`https://discord.gg/${discordInviteUrl}`" target="_blank">
            <IconDiscord />
          </a>
        </Button>
        <AppInfoButton />
      </div>
    </div>
  </header>
</template>
