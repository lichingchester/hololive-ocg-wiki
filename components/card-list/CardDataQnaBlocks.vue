<script lang="ts" setup>
import { MessagesSquare, Copy } from "lucide-vue-next";
import type { Card } from "@/types/card";
import { UseClipboard } from "@vueuse/components";

// const { locale } = useI18n();

defineProps<{
  item: Card;
}>();
</script>

<template>
  <div v-if="item?.qa_items?.length" class="">
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger class="flex gap-2 p-2 rounded-lg border bg-accent/50">
          <div class="flex text-sm gap-2">
            <MessagesSquare class="size-5" /> Q&A
          </div>
        </AccordionTrigger>
        <AccordionContent
          class="pb-0 pt-2 md:pt-4 flex flex-col gap-2 md:gap-4"
        >
          <template v-for="(qaItem, index) in item?.qa_items" :key="index">
            <div
              class="flex flex-col gap-2 p-2 rounded-lg border bg-accent/50 ml-2 md:ml-4"
            >
              <div class="font-semibold">
                {{ qaItem.title }}
              </div>

              <div class="grid grid-cols-[auto_1fr] gap-2">
                <div class="">Q:</div>
                <div class="">
                  {{ qaItem.question }}
                </div>
                <div class="">A:</div>
                <div class="">
                  {{ qaItem.answer }}
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <template
                  v-for="(cardNumber, cardIndex) in qaItem.related_card_numbers"
                >
                  <UseClipboard v-slot="{ copy, copied }" source="copy">
                    <div class="relative">
                      <Badge
                        :index="cardIndex"
                        variant="outline"
                        class="cursor-pointer"
                        @click="copy()"
                      >
                        <Copy />
                        {{ cardNumber }}
                      </Badge>
                      <Transition name="copied">
                        <span
                          v-if="copied"
                          class="absolute bottom-full md:top-auto md:bottom-[calc(100%+0rem)] left-2/4 -translate-x-2/4 -translate-y-1 rounded-lg bg-green-400 text-slate-800 text-xs py-1 px-2 whitespace-nowrap"
                        >
                          {{ $t("Copied") }}
                        </span>
                      </Transition>
                    </div>
                  </UseClipboard>
                </template>
              </div>
            </div>
          </template>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>
