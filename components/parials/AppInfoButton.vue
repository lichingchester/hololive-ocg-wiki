<script setup lang="ts">
import { Copyright } from "lucide-vue-next";
import { APP_VERSION } from "~/constants/app";
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon">
        <Copyright />
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader class="text-start">
        <DialogTitle class="">
          Hololive OCG wiki
          <Badge size="sm" variant="outline" class="ml-2">
            <span class="text-xs">{{ `v${APP_VERSION}` }}</span>
          </Badge>
        </DialogTitle>
        <DialogDescription> wip... </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
</template>
