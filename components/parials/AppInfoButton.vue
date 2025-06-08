<script setup lang="ts">
import { Info } from "lucide-vue-next";
import { APP_VERSION } from "~/constants/app";
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon">
        <Info />
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
        <DialogDescription>
          <div>wip...</div>
          <br />
          <div>
            Just got suspended without reason, really upsetting, looking for a
            new platform for this open-source project, keep you all updated
            here.
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
</template>
