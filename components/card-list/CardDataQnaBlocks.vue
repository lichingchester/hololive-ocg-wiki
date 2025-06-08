<script lang="ts" setup>
import { MessagesSquare } from "lucide-vue-next";
import type { Card } from "@/types/card";

const { locale } = useI18n();

defineProps<{
  item: Card;
}>();
</script>

<template>
  <div v-if="item.translations[locale]?.qa_items" class="">
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
          <template
            v-for="(qaItem, index) in item.translations[locale]?.qa_items"
            :key="index"
          >
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

              <div class="flex gap-2">
                <template v-if="qaItem.related_cards.includes('\n')">
                  <template
                    v-for="(card, cardIndex) in qaItem.related_cards.split(
                      '\n'
                    )"
                  >
                    <Badge :index="cardIndex" variant="outline">
                      {{ card }}
                    </Badge>
                  </template>
                </template>

                <template v-else>
                  <Badge variant="outline"> {{ qaItem.related_cards }} </Badge>
                </template>
              </div>
            </div>
          </template>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>
