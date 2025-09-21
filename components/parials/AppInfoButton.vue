<script setup lang="ts">
import { Info } from "lucide-vue-next";

const runtimeConfig = useRuntimeConfig();

const releaseImgUrl = ref("");
const contents = ref<string[]>([]);
const disclaimer = ref("");

const info = await $fetch(runtimeConfig.public.infoUrl);

// Check if info is object or JSON string and parse if needed
const infoData = typeof info === "string" ? safeJsonParse(info) : info;

if (infoData?.["release-shields-url"]) {
  releaseImgUrl.value = infoData["release-shields-url"];
}
if (infoData?.["contents"]) {
  contents.value = infoData["contents"];
}
if (infoData?.["disclaimer"]) {
  disclaimer.value = infoData["disclaimer"];
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

if (infoData?.["release-shields-url"]) {
  releaseImgUrl.value = infoData["release-shields-url"];
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon">
        <Info />
      </Button>
    </DialogTrigger>
    <DialogScrollContent class="sm:max-w-[425px]">
      <DialogHeader class="text-start">
        <DialogTitle class="flex gap-2">
          Hololive OCG Wiki
          <img alt="Release" :src="releaseImgUrl" />
        </DialogTitle>
        <DialogDescription>
          <div class="flex gap-2">
            <Button variant="outline" size="icon" as-child>
              <a
                href="https://gitlab.com/lichingchester/hololive-ocg-wiki"
                target="_blank"
              >
                <IconGitlab />
              </a>
            </Button>
            <Button variant="outline" size="icon" as-child>
              <a href="https://discord.gg/USMgkeYujz" target="_blank">
                <IconDiscord />
              </a>
            </Button>
          </div>

          <p
            class="leading-5 [&:not(:first-child)]:mt-4"
            v-for="(content, index) in contents"
            :key="index"
            v-html="content"
          />

          <hr class="[&:not(:first-child)]:mt-4" />

          <p
            class="leading-5 [&:not(:first-child)]:mt-4"
            v-html="disclaimer"
          ></p>
        </DialogDescription>
      </DialogHeader>
    </DialogScrollContent>
  </Dialog>
</template>
