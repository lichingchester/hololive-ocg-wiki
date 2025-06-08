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
          <p class="leading-5 [&:not(:first-child)]:mt-4">
            I was suspended by GitHub without reason, which was really
            upsetting. <br />
            I've now moved the project to GitLab and will continue development
            there.
          </p>
          <p class="leading-5 [&:not(:first-child)]:mt-4">
            This is an open-source project—pull requests are welcome!
          </p>
          <p class="leading-5 [&:not(:first-child)]:mt-4">
            A new Discord community group is being prepared. I'll keep you all
            updated once it's ready.
          </p>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
</template>
