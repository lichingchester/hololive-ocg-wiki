<script lang="ts" setup>
const [UseTemplate, FilterPanel] = createReusableTemplate();
const isDesktop = useMediaQuery("(min-width: 768px)");
const isOpen = ref(false);
</script>

<template>
  <UseTemplate>
    <form class="grid items-start gap-4 px-4">
      <div class="grid gap-2">
        <Label html-for="email">Email</Label>
        <Input id="email" type="email" default-value="shadcn@example.com" />
      </div>
      <div class="grid gap-2">
        <Label html-for="username">Username</Label>
        <Input id="username" default-value="@shadcn" />
      </div>
      <Button type="submit"> Save changes </Button>
    </form>
  </UseTemplate>

  <div class="">
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <FilterPanel />

        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline"> Cancel </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
</template>
