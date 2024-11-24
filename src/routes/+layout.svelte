<script lang="ts">
    import {
        Avatar,
        BottomNav,
        BottomNavHeader,
        BottomNavHeaderItem,
        BottomNavItem,
        Button,
        Darkmode,
        Dropdown,
        DropdownFooter,
        DropdownHeader,
        DropdownLi,
        DropdownUl,
        Input,
        Navbar,
        NavBrand,
        NavLi,
        NavUl,
        Sidebar,
        SidebarDropdownWrapper,
        SidebarGroup,
        SidebarItem,
        uiHelpers
    } from 'svelte-5-ui-lib';
    import {
        AdjustmentsVerticalOutline,
        BookmarkSolid,
        ChartOutline,
        EditSolid,
        GridSolid,
        HomeSolid,
        PlusOutline,
        SearchOutline,
        ShoppingBagSolid,
        UserSolid
    } from "flowbite-svelte-icons";
    import {page} from '$app/stores';
    import {sineIn} from "svelte/easing";
    import '../app.css';

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
            <NavBrand siteName="Svelte Forum">
                <img width="30" src="/images/svelte-icon.png" alt="svelte icon"/>
            </NavBrand>
        {/snippet}
        {#snippet navSlotBlock()}
            <div class="flex items-center space-x-1 order-2">
                <Button class="me-1 rounded-lg bg-white p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 lg:hidden dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                    <SearchOutline class="h-5 w-5"/>
                </Button>
                <div class="relative hidden lg:block">
                    <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                        <SearchOutline class="h-4 w-4"/>
                    </div>
                    <Input id="search-navbar" class="bg-transparent ps-10" placeholder="Search..."/>
                </div>
            </div>
            <div class="flex items-center space-x-1 order-3">
                <Darkmode class="hidden sm:block"/>
            </div>
            <div class="flex items-center space-x-1 order-4">
                <Avatar class="rotate-90 me-1 ms-3" onclick={dropdownUser.toggle} src="/images/svelte-icon.png"
                        dot={{ color: "green" }}/>
                <div class="relative">
                    <Dropdown dropdownStatus={dropdownUserStatus} closeDropdown={closeDropdownUser}
                              params={{ y: 0, duration: 200, easing: sineIn }}
                              class="absolute -left-[110px] top-[14px] md:-left-[160px] ">
                        <DropdownHeader class="px-4 py-2">
                            <span class="block text-sm text-gray-900 dark:text-white">Bonnie Green</span>
                            <span class="block truncate text-sm font-medium">name@flowbite.com</span>
                        </DropdownHeader>
                        <DropdownUl>
                            <DropdownLi href="/">Dashboard</DropdownLi>
                            <DropdownLi href="/components/drawer">Drawer</DropdownLi>
                            <DropdownLi href="/components/footer">Footer</DropdownLi>
                            <DropdownLi href="/components">Alert</DropdownLi>
                            <DropdownLi>
                                <Darkmode class="text-primary-500 dark:border-gray-800 dark:text-primary-600"/>
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
            <NavLi href="/">Home</NavLi>
            <NavLi href="/components/navbar">Navbar</NavLi>
            <NavLi href="/components/footer">Footer</NavLi>
        </NavUl>
    </Navbar>
</header>

<div class="lg:flex" id="sidebar">
    <Sidebar {activeUrl} isSingle={false} backdrop={false} isOpen={isDemoOpen} closeSidebar={closeDemoSidebar}
             activeClass="flex items-center p-1 text-base font-normal text-white dark:hover:text-white hover:text-gray-900 bg-primary-700 dark:bg-primary-700 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
             nonActiveClass="p-1 hover:bg-gray-200" divClass="dark:bg-gray-900 bg-gray-50"
             class="top-[62px] h-screen dark:bg-gray-900">
        <SidebarGroup>
            <SidebarDropdownWrapper label="Shop" btnClass="p-2">
                {#snippet iconSlot()}
                    <ShoppingBagSolid/>
                {/snippet}
                <SidebarItem label="Products" href=""/>
            </SidebarDropdownWrapper>
            <SidebarItem label="Dashboard">
                {#snippet iconSlot()}
                    <ChartOutline/>
                {/snippet}
            </SidebarItem>
            <SidebarDropdownWrapper label="Profile" btnClass="p-2">
                {#snippet iconSlot()}
                    <UserSolid/>
                {/snippet}
                <SidebarItem label="Projects" href="/"/>
            </SidebarDropdownWrapper>
            <SidebarItem label="Sidebar" {spanClass} href="/components/sidebar">
                {#snippet iconSlot()}
                    <GridSolid/>
                {/snippet}
            </SidebarItem>
        </SidebarGroup>
        <SidebarGroup border>
            <SidebarDropdownWrapper label="Setting" btnClass="p-2">
                {#snippet iconSlot()}
                    <EditSolid/>
                {/snippet}
                <SidebarItem label="Account" href=""/>
            </SidebarDropdownWrapper>
        </SidebarGroup>
    </Sidebar>

    <main class="mx-auto min-w-0 max-w-7xl flex-auto px-8 pb-20 lg:static lg:max-h-full overflow-auto md:pl-72">
        <div id="mainContent">
            {@render children()}
        </div>
    </main>
</div>

<!--only show BottomNav on mobile-->
<BottomNav outerClass="hidden max-sm:block" position="fixed" navType="group" innerClass="grid-cols-5">
    {#snippet header()}
        <BottomNavHeader>
            <BottomNavHeaderItem itemName="New"/>
            <BottomNavHeaderItem itemName="Popular" active={true}/>
            <BottomNavHeaderItem itemName="Following"/>
        </BottomNavHeader>
    {/snippet}
    <BottomNavItem btnName="Home">
        <HomeSolid
                class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"/>
    </BottomNavItem>
    <BottomNavItem btnName="Bookmark">
        <BookmarkSolid
                class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"/>
    </BottomNavItem>
    <BottomNavItem btnName="New post">
        <PlusOutline
                class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"/>
    </BottomNavItem>
    <BottomNavItem btnName="Search">
        <SearchOutline
                class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"/>
    </BottomNavItem>
    <BottomNavItem btnName="Settings">
        <AdjustmentsVerticalOutline
                class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"/>
    </BottomNavItem>
</BottomNav>
