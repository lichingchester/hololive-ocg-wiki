<script setup lang="ts">
import { Info } from "lucide-vue-next";
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
          <img
            alt="GitLab Release"
            src="https://img.shields.io/gitlab/v/release/70581893"
          />
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

          <p class="leading-5 [&:not(:first-child)]:mt-4">
            This is an open-source project—pull requests are welcome!
          </p>
          <p class="leading-5 [&:not(:first-child)]:mt-4">
            We’ve just launched our Discord community for the Hololive OCG
            project! Join us to connect, exchange ideas, and collaborate with
            others who share your passion.
          </p>
          <p class="leading-5 [&:not(:first-child)]:mt-4">
            I was suspended by GitHub without reason, which was really
            upsetting. <br />
            I've now moved the project to GitLab and will continue development
            there.
          </p>

          <hr class="[&:not(:first-child)]:mt-4" />

          <p class="leading-5 [&:not(:first-child)]:mt-4">
            This wiki is a fan-made, non-official project. All content is
            created by the community and follows
            <a
              target="_blank"
              class="underline"
              href="https://hololivepro.com/en/terms/"
              >Cover Corp.'s Derivative Works Guidelines</a
            >
            . Hololive names, images, and related content are the property of
            Cover Corp. This site is not affiliated with or endorsed by Cover
            Corp. or hololive production.
          </p>
        </DialogDescription>
      </DialogHeader>
    </DialogScrollContent>
  </Dialog>
</template>
