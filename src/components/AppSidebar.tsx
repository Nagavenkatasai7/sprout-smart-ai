import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Leaf,
  Calendar,
  Camera,
  Users,
  BookOpen,
  ShoppingCart,
  Settings,
  Search,
  Bell,
  Star,
  BarChart3,
  PlusCircle,
  Heart,
  Sprout,
  ChevronDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Garden", url: "/my-garden", icon: Leaf },
  { title: "Plant Calendar", url: "/plant-calendar", icon: Calendar },
  { title: "Plant Identification", url: "/plant-identification", icon: Camera },
];

const plantCareItems = [
  { title: "Plant Doctor", url: "/plant-doctor", icon: Sprout },
  { title: "Plant Guide", url: "/plant-guide", icon: BookOpen },
  { title: "Seasonal Planting", url: "/seasonal-planting", icon: Calendar },
  { title: "Propagation Guides", url: "/propagation-guides", icon: PlusCircle },
];

const communityItems = [
  { title: "Community", url: "/community-marketplace", icon: Users },
  { title: "Transformation Gallery", url: "/transformation-gallery", icon: Star },
  { title: "Virtual Workshops", url: "/virtual-workshops", icon: BookOpen },
];

const shoppingItems = [
  { title: "Plant Care Kits", url: "/plant-care-kits", icon: ShoppingCart },
  { title: "Shopping Assistant", url: "/shopping-assistant", icon: ShoppingCart },
  { title: "Affiliate Store", url: "/affiliate-store", icon: ShoppingCart },
];

const learnItems = [
  { title: "Growing Programs", url: "/growing-programs", icon: BarChart3 },
  { title: "Plant Matchmaker", url: "/plant-matchmaker", icon: Heart },
  { title: "Sustainability", url: "/sustainability-features", icon: Leaf },
  { title: "Documentation", url: "/documentation", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    plantCare: true,
    community: false,
    shopping: false,
    learn: false,
  });

  const collapsed = state === 'collapsed';
  const isActive = (path: string) => location.pathname === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50";

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const isGroupActive = (items: typeof mainNavItems) => {
    return items.some(item => isActive(item.url));
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="overflow-y-auto">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Plant Care */}
        <SidebarGroup>
          <Collapsible 
            open={openGroups.plantCare || isGroupActive(plantCareItems)} 
            onOpenChange={() => toggleGroup('plantCare')}
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group/collapsible w-full">
                Plant Care
                {!collapsed && (
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {plantCareItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavCls}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Community */}
        <SidebarGroup>
          <Collapsible 
            open={openGroups.community || isGroupActive(communityItems)} 
            onOpenChange={() => toggleGroup('community')}
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group/collapsible w-full">
                Community
                {!collapsed && (
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {communityItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavCls}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Shopping */}
        <SidebarGroup>
          <Collapsible 
            open={openGroups.shopping || isGroupActive(shoppingItems)} 
            onOpenChange={() => toggleGroup('shopping')}
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group/collapsible w-full">
                Shopping
                {!collapsed && (
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {shoppingItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavCls}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Learn */}
        <SidebarGroup>
          <Collapsible 
            open={openGroups.learn || isGroupActive(learnItems)} 
            onOpenChange={() => toggleGroup('learn')}
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group/collapsible w-full">
                Learn & Grow
                {!collapsed && (
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {learnItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavCls}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/plant-wishlist" className={getNavCls}>
                    <Heart className="h-4 w-4" />
                    {!collapsed && <span>Wishlist</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/achievements" className={getNavCls}>
                    <Star className="h-4 w-4" />
                    {!collapsed && <span>Achievements</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/account" className={getNavCls}>
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}