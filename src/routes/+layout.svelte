<script lang="ts">
    import {
        Avatar,
        BottomNav,
        BottomNavHeader,
        BottomNavHeaderItem,
        BottomNavItem,
      Tooltip,
        Button,
        Dropdown,
        DropdownLi,
        DropdownUl,
        Input,
        Navbar,
        NavBrand,
        NavLi,
        NavUl,
        SidebarGroup,
        SidebarItem,
        DropdownFooter,
        uiHelpers,
        SidebarDropdownWrapper,
        Darkmode,
        Sidebar,
        DropdownHeader
    } from 'svelte-5-ui-lib';
    import {page} from '$app/stores';
    import {sineIn} from "svelte/easing";
    import '../app.css';
    import BookmarkFill from 'svelte-bootstrap-svg-icons/BookmarkFill.svelte';
    import CardList from 'svelte-bootstrap-svg-icons/CardList.svelte';
    import ChatLeftDots from 'svelte-bootstrap-svg-icons/ChatLeftDots.svelte';
    import HouseDoor from 'svelte-bootstrap-svg-icons/HouseDoor.svelte';
    import HouseDoorFill from 'svelte-bootstrap-svg-icons/HouseDoorFill.svelte';
    import PencilSquare from 'svelte-bootstrap-svg-icons/PencilSquare.svelte';
    import PersonFill from 'svelte-bootstrap-svg-icons/PersonFill.svelte';
    import Plus from 'svelte-bootstrap-svg-icons/Plus.svelte';
    import Search from 'svelte-bootstrap-svg-icons/Search.svelte';
    import Sliders2Vertical from 'svelte-bootstrap-svg-icons/Sliders2Vertical.svelte';
    import { assemble_avatar_full_url, pathname2title } from '$lib';
    import { dbb } from '$lib/dbb';
    import { onMount } from 'svelte';
    import { PUBLIC_DISCOURSE_HOST } from '$env/static/public';

    let {children, data} = $props();
    let activeUrl = $state($page.url.pathname);
    let nav = uiHelpers();
    let dropdownUser = uiHelpers();
    let dropdownUserStatus = $state(false);
    let closeDropdownUser = dropdownUser.close;
    const spanClass = "flex-1 ms-3 whitespace-nowrap";
    const demoSidebarUi = uiHelpers();
    let isDemoOpen = $state(false);
    const closeDemoSidebar = demoSidebarUi.close;
    $effect(() => {
        dropdownUserStatus = dropdownUser.isOpen;
        activeUrl = $page.url.pathname;
        isDemoOpen = demoSidebarUi.isOpen;
    });
    let navClass = "w-full divide-gray-200 border-gray-200 bg-gray-50 dark_bg_theme text-gray-500 dark:divide-gray-700 dark:border-gray-700 dark:transparent dark:text-gray-400 sm:px-4";
    function toggleDarkMode(event) {
        let target = event.target;
        let child = target.querySelector('.darkmode-button-in-avatar-dropdown');
        child?.click();
    }
    async function init_dbd_cache() {
        let dbdc = await dbb.cache.toCollection().last();
        if (!dbdc || dbdc.api_key !== data.api_key) {
            await dbb.cache.clear();
            await dbb.cache.add({api_key: data.api_key, api_username: data.user.username});
        }
    }
    onMount(async () => {
        await init_dbd_cache();
    });
    let site_name = $derived(pathname2title($page.url.pathname));
</script>
<header class="sticky top-0 z-50 mx-auto w-full flex-none border-b border-gray-200 bg-gray-50 lg:pl-4 dark:border-gray-600 dark:bg-gray-950">
    <Navbar {navClass} hamburgerMenu={false} fluid div2Class="ml-auto w-full">
        {#snippet brand()}
            <button onclick={demoSidebarUi.toggle} type="button" class="z-50 mr-4 mt-1 md:hidden"
                    aria-controls="sidebar"
                    aria-expanded={isDemoOpen}>
                <span class="sr-only">Toggle sidebar menu</span>
                <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                     viewBox="0 0 17 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
            </button>
            <NavBrand siteName={site_name}>
                <img width="30" src="/images/svelte-icon.png" alt="svelte icon"/>
            </NavBrand>
        {/snippet}
        {#snippet navSlotBlock()}
<!--            <div class="flex items-center space-x-1 order-2">-->
<!--                <Button class="me-1 rounded-lg bg-white p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 lg:hidden dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700">-->
<!--                    <Search class="h-5 w-5"/>-->
<!--                </Button>-->
<!--                <div class="relative hidden lg:block">-->
<!--                    <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">-->
<!--                        <Search class="h-4 w-4"/>-->
<!--                    </div>-->
<!--                    <Input id="search-navbar" class="bg-transparent ps-10" placeholder="Search..."/>-->
<!--                </div>-->
<!--            </div>-->
            <div class="flex items-center space-x-1 order-3">
                <Darkmode class="hidden lg:block"/>
            </div>
            <div class="flex items-center space-x-1 order-4">
                <Avatar class="rotate-360 me-1 ms-3" onclick={dropdownUser.toggle} src={assemble_avatar_full_url(data.user?.avatar_template)}
                        dot={{ color: "green" }}/>
                <div class="relative">
                    <Dropdown dropdownStatus={dropdownUserStatus} closeDropdown={closeDropdownUser}
                              params={{ y: 0, duration: 200, easing: sineIn }}
                              class="absolute -left-[110px] top-[14px] md:-left-[160px] ">
                        <DropdownHeader class="px-4 py-2">
                            <span class="block text-sm">{data.user?.name}</span>
                            <span class="block truncate text-sm font-medium">{data.user?.username}</span>
                        </DropdownHeader>
                        <DropdownUl>
                            <DropdownLi href="/settings">Settings</DropdownLi>
                            <DropdownLi>
                                <button class="lg:hidden w-full text-left" onclick={event => toggleDarkMode(event)}>
                                    <Darkmode
                                            class="darkmode-button-in-avatar-dropdown"/>
                                </button>
                            </DropdownLi>
                        </DropdownUl>
                        <DropdownFooter class="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">Sign out
                        </DropdownFooter>
                    </Dropdown>
                </div>
            </div>

        {/snippet}
        <!--only show NavUl on desktop, no NavHamburger on mobile-->
        <NavUl class="order-1 me-1 ms-1" {activeUrl}>
            <NavLi href={PUBLIC_DISCOURSE_HOST}>West</NavLi>
        </NavUl>
    </Navbar>
</header>

<div class="lg:flex" id="sidebar">
    <Sidebar isSingle={false} backdrop={false} isOpen={isDemoOpen} closeSidebar={closeDemoSidebar}
             activeClass="flex items-center p-1 text-base font-normal text-white dark_bg_theme dark:hover:text-white hover:text-gray-900 bg-primary-700 rounded-lg dark:divide-gray-700 dark:border-gray-700 dark:transparent dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
             nonActiveClass="p-1 hover:bg-gray-200" divClass="bg-gray-50"
             class="top-[62px] h-screen dark:bg-gray-900" activeUrl={activeUrl}>
        <SidebarGroup>
            <SidebarItem label="Home" href="/">
                {#snippet iconSlot()}
                    <HouseDoor/>
                {/snippet}
            </SidebarItem>
            <SidebarItem label="Compose" href="/compose">
                {#snippet iconSlot()}
                    <PencilSquare/>
                {/snippet}
            </SidebarItem>
            <SidebarDropdownWrapper label="My ..." isOpen={true}>
                {#snippet iconSlot()}
                    <PersonFill/>
                {/snippet}
                <SidebarItem label="Topics" href="/my/topics" class="pl-4">
                    {#snippet iconSlot()}
                        <CardList/>
                    {/snippet}
                </SidebarItem>
                <SidebarItem label="Replies" href="/my/replies" class="pl-4">
                    {#snippet iconSlot()}
                        <ChatLeftDots/>
                    {/snippet}
                </SidebarItem>
            </SidebarDropdownWrapper>
        </SidebarGroup>

    </Sidebar>

    <main class="text-gray-900 dark:text-gray-100 mx-auto min-w-0 max-w-8xl flex-auto px-8 pb-20 lg:static lg:max-h-full overflow-auto md:pl-72">
        <div id="mainContent">
            {@render children()}
        </div>
    </main>
</div>

<!--only show BottomNav on mobile-->
<BottomNav outerClass="hidden max-sm:block" position="fixed" navType="group" innerClass="grid-cols-5">
    <!--{#snippet header()}-->
    <!--    <BottomNavHeader>-->
    <!--        <BottomNavHeaderItem itemName="New"/>-->
    <!--        <BottomNavHeaderItem itemName="Popular" active={true}/>-->
    <!--        <BottomNavHeaderItem itemName="Following"/>-->
    <!--    </BottomNavHeader>-->
    <!--{/snippet}-->
    <BottomNavItem btnName="Experimental">
        <span class="text-gray-900 dark:text-white">Under construction</span>
    </BottomNavItem>
    <BottomNavItem btnName="West" href={PUBLIC_DISCOURSE_HOST}>
        <span class="text-gray-900 dark:text-white">West</span>
    </BottomNavItem>
    <BottomNavItem btnName="New post" href="/compose">
        <Plus
                class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"/>
    </BottomNavItem>
    <BottomNavItem btnName="East" href="/">
        <HouseDoorFill
          class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"/>
    </BottomNavItem>
    <BottomNavItem btnName="Settings" href="/settings">
        <Sliders2Vertical
                class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"/>
    </BottomNavItem>

</BottomNav>
