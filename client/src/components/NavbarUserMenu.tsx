"use client";

import { signOut } from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthUser } from "@/hooks/use-auth-user";
import { DASHBOARD_HOME, SETTINGS_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/constants";
import { api } from "@/state/api";
import { useAppDispatch } from "@/state/store";

const MENU_ITEM_CLASS = "cursor-pointer focus:bg-primary-700 focus:text-primary-100";

export function NavbarUserMenu() {
  const { authStatus, data: authUser, isError } = useAuthUser();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    dispatch(api.util.resetApiState());
    router.push("/");
  };

  if (authStatus === "unauthenticated") {
    return (
      <nav className="flex items-center gap-5">
        <Button
          asChild
          variant="outline"
          className="rounded-lg border-white bg-transparent text-white hover:bg-white hover:text-primary-700"
        >
          <Link href={SIGN_IN_PATH}>Sign In</Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="rounded-lg bg-secondary-600 text-white hover:bg-white hover:text-primary-700"
        >
          <Link href={SIGN_UP_PATH}>Sign Up</Link>
        </Button>
      </nav>
    );
  }

  if (authStatus === "authenticated" && isError) {
    return (
      <Button variant="secondary" onClick={() => void handleSignOut()}>
        Sign out
      </Button>
    );
  }

  if (!authUser) {
    return <Skeleton className="h-9 w-32 bg-primary-600" aria-label="Loading account" />;
  }

  const { userInfo, userRole } = authUser;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
        <Avatar>
          <AvatarFallback className="bg-primary-600 text-white">
            {userInfo.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-primary-200 md:block">{userInfo.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white text-primary-700">
        <DropdownMenuItem asChild className={`${MENU_ITEM_CLASS} font-bold`}>
          <Link href={DASHBOARD_HOME[userRole]} scroll={false}>
            Go to Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-primary-200" />
        <DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
          <Link href={SETTINGS_PATH[userRole]} scroll={false}>
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={MENU_ITEM_CLASS} onSelect={() => void handleSignOut()}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
