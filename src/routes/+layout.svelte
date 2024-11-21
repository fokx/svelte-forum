<script>
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
        ImagePlaceholder,
        Input,
        Navbar,
        NavBrand,
        NavHamburger,
        NavLi,
        NavUl,
        Skeleton,
        TextPlaceholder,
        uiHelpers
    } from 'svelte-5-ui-lib';

    import {
        AdjustmentsVerticalOutline,
        BookmarkSolid,
        HomeSolid,
        PlusOutline,
        SearchOutline
    } from "flowbite-svelte-icons";
    import {page} from '$app/stores';
    import {sineIn} from "svelte/easing";
    import '../app.css';

    let {children, data} = $props();

    let activeUrl = $state($page.url.pathname);

    let nav = uiHelpers();
    let navStatus = $state(false);
    let toggleNav = nav.toggle;
    let closeNav = nav.close;
    let dropdownUser = uiHelpers();
    let dropdownUserStatus = $state(false);
    let closeDropdownUser = dropdownUser.close;
    $effect(() => {
        dropdownUserStatus = dropdownUser.isOpen;
        navStatus = nav.isOpen;
        activeUrl = $page.url.pathname;
    });

</script>


<Navbar {toggleNav} {closeNav} {navStatus} hamburgerMenu={false} breakPoint="md"
        navClass="absolute w-full z-20 top-0 start-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">

    {#snippet brand()}
        <NavBrand siteName="Svelte 5 UI Lib">
            <img width="30" src="/images/svelte-icon.png" alt="svelte icon"/>
        </NavBrand>
    {/snippet}
    {#snippet navSlotBlock()}
        <div class="flex items-center space-x-1 md:order-2">
            <Button class="me-1 rounded-lg bg-white p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                <SearchOutline class="h-5 w-5"/>
            </Button>
            <div class="relative hidden md:block">
                <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                    <SearchOutline class="h-4 w-4"/>
                </div>
                <Input id="search-navbar" class="bg-transparent ps-10" placeholder="Search..."/>
            </div>
            <NavHamburger {toggleNav}/>
        </div>
        <div class="flex items-center space-x-1 md:order-3">
            <Avatar onclick={dropdownUser.toggle} src="/images/svelte-icon.png" dot={{ color: "green" }}/>
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
    <NavUl class="order-1" {activeUrl}>
        <NavLi href="/">Home</NavLi>
        <NavLi href="/components/navbar">Navbar</NavLi>
        <NavLi href="/components/footer">Footer</NavLi>
    </NavUl>
</Navbar>

<div style="height: calc(100vh);" class="overflow-auto px-8 py-24">
    <div id="mainContent">
        {@render children()}
    </div>
    <Skeleton class="py-4"/>
    <Skeleton class="mb-8 mt-16"/>
    <ImagePlaceholder class="my-8"/>
    <TextPlaceholder class="my-8"/>
</div>
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
