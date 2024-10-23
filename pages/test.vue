<template>
    <div class="h-screen">
        <div
            class="relative w-full before:absolute before:w-12 before:h-12 before:content[''] before:right-0 before:bg-primary before:rounded-full before:blur-lg after:absolute after:-z-10 after:w-20 after:h-20 after:content[''] after:bg-primary/50 after:right-12 after:top-3 after:rounded-full after:blur-lg">
            <input placeholder="Search for Residents..."
                class="relative bg-transparent ring-0 outline-none border border-none placeholder-foreground text-md rounded-lg focus:border-none placeholder-opacity-60 focus:border-violet-500 block w-full p-2.5 text-center"
                type="text">
        </div>
        <ol class="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="goal in imageSources">
                <div class="bg-card p-2 rounded-md relative">
                    <div v-if="goal.new"
                        class="absolute top-0 right-0 rounded-bl-md rounded-tr-md bg-primary/40 backdrop-blur-sm text-white p-2 text-sm z-10 shadow">
                        New</div>
                    <div class="relative">
                        <div class="overflow-x-scroll overflow-y-hidden rounded-sm flex snap-mandatory snap-x"
                            @scroll="onscroll">
                            <div v-for="(source, index) in goal.images" :key="index"
                                class="flex-none aspect-[4/3] w-full snap-start">
                                <img :src="source" class="w-full h-full object-cover" loading="lazy" />
                            </div>
                        </div>
                        <div class="absolute inset-y-0 left-0 flex items-center justify-center cursor-pointer hover:backdrop-blur-sm"
                            @click="scrollTo(Math.max(0, selectedImage - 1))">
                            <Icon name="mdi:chevron-left" class="text-white" size="40" />
                        </div>
                        <div class="absolute inset-y-0 right-0 flex items-center justify-center cursor-pointer hover:backdrop-blur-sm"
                            @click="scrollTo(Math.min(imageSources.length, selectedImage + 1))">
                            <Icon name="mdi:chevron-right" class="text-white" size="40" />
                        </div>
                        <div class="absolute bottom-0 right-[50%] translate-x-[50%] p-2 bg-opacity-50">
                            <span v-for="(source, index) in goal.images" :key="index"
                                :class="selectedImage === index ? 'bg-primary/90 scale-125 shadow-md shadow-primary' : 'bg-muted-foreground/70'"
                                class="w-2 h-2 rounded-full inline-block mx-1 transition-transform cursor-pointer"
                                @click="scrollTo(index)"></span>
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-xl font-bold mt-2">{{ goal.title }}</h2>
                            <p class="text-sm text-muted-foreground">{{ goal.description }}</p>
                        </div>
                        <Icon name="mdi:bookmark-plus-outline" class="text-primary" size="35" />
                    </div>
                    <div class="grid grid-cols-2 gap-2 border px-1 rounded mt-2">
                        <div class="border-r">
                            <span class="text-muted-foreground text-sm leading-none ml-1">Rating</span>
                            <div class="flex items-center space-x-1">
                                <Icon name="mdi:star" class="text-primary" size="20" />
                                <span>{{ goal.rating }}</span>
                            </div>
                        </div>
                        <div>
                            <span class="text-muted-foreground text-sm leading-none ml-1">Location</span>
                            <div class="flex items center space-x-1">
                                <Icon name="mdi:map-marker" class="text-primary" size="20" />
                                <span>{{ goal.location }}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        class="group/button w-full relative inline-flex items-center justify-center overflow-hidden rounded-md bg-primary/60 hover:bg-primary/90 backdrop-blur-lg px-4 py-2 mt-4 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:shadow-md hover:shadow-primary/50 border border-white/20">
                        <span class="text-lg">Reserve {{ goal.type }}</span>
                        <div
                            class="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                            <div class="relative h-full w-10 bg-white/30"></div>
                        </div>
                    </button>
                </div>
            </li>
        </ol>
        <SystemColorMode />
    </div>
</template>

<script lang="ts" setup>
const imageSources = [
    {
        type: 'cabin',
        title: 'Remote Cabin',
        description: 'A beautiful cabin in the woods',
        rating: 4.5,
        location: 'Germany',
        new: true,
        images: [
            "https://img.freepik.com/premium-photo/remote-cabin-nestled-forest-clearing-surrounded-by-towering-trees_1234738-105031.jpg",
            "https://img.freepik.com/premium-photo/secluded-cabin-nestled-woods_1022456-138572.jpg",
            "https://img.freepik.com/premium-photo/cozy-log-cabin-nestled-woods_1022456-186896.jpg",
            "https://img.freepik.com/premium-photo/log-cabin-woods_1130573-38449.jpg"
        ],
    },
    {
        type: 'cabin',
        title: 'Remote Cabin',
        description: 'A beautiful cabin in the woods',
        rating: 4.5,
        location: 'Germany',
        new: true,
        images: [
            "https://img.freepik.com/premium-photo/remote-cabin-nestled-forest-clearing-surrounded-by-towering-trees_1234738-105031.jpg",
            "https://img.freepik.com/premium-photo/secluded-cabin-nestled-woods_1022456-138572.jpg",
            "https://img.freepik.com/premium-photo/cozy-log-cabin-nestled-woods_1022456-186896.jpg",
            "https://img.freepik.com/premium-photo/log-cabin-woods_1130573-38449.jpg"
        ],
    },
    {
        type: 'cabin',
        title: 'Remote Cabin',
        description: 'A beautiful cabin in the woods',
        rating: 4.5,
        location: 'Germany',
        new: true,
        images: [
            "https://img.freepik.com/premium-photo/remote-cabin-nestled-forest-clearing-surrounded-by-towering-trees_1234738-105031.jpg",
            "https://img.freepik.com/premium-photo/secluded-cabin-nestled-woods_1022456-138572.jpg",
            "https://img.freepik.com/premium-photo/cozy-log-cabin-nestled-woods_1022456-186896.jpg",
            "https://img.freepik.com/premium-photo/log-cabin-woods_1130573-38449.jpg"
        ],
    },
]

const selectedImage = ref(0);
const onscroll = (event: Event) => {
    const target = event.target as HTMLElement;
    const scrollLeft = target.scrollLeft;
    const width = target.clientWidth;
    const index = Math.round(scrollLeft / width);
    selectedImage.value = index;
}

const scrollTo = (index: number) => {
    const container = document.querySelector('.snap-mandatory') as HTMLElement;
    container.scrollTo({
        left: index * container.clientWidth,
        behavior: 'smooth',
    });
}
</script>