import { Menu, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";

// external imports
import {
  ArrowLeftOnRectangleIcon,
  DocumentTextIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 0) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      aria-label="navbar"
      className={
        isScrolled
          ? "fixed top-0 left-0 z-20 flex w-full items-center gap-4 bg-gray-900"
          : "fixed top-0 left-0 z-20 flex w-full items-center gap-4"
      }
      onScroll={handleScroll}
    >
      <nav className="container mx-auto flex max-w-screen-lg items-center justify-between border-b-2 border-b-gray-500 px-4 py-5">
        <Link
          aria-label="navigate to home page"
          href="/"
          className="flex items-center gap-1.5 font-mono text-base text-white transition-opacity hover:opacity-80 active:opacity-90 sm:text-lg"
        >
          <DocumentTextIcon className="aspect-square w-5" aria-hidden="true" />
          Biogen
        </Link>
        {status === "authenticated" ? (
          <Menu as="div" className="relative inline-block">
            <div>
              <Menu.Button className="rounded-full ring-1 ring-white/75 transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 active:opacity-90">
                <Image
                  src={session.user.image as string}
                  alt={session.user.name as string}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-1 w-40 origin-top-right rounded-md bg-gray-100 p-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <Menu.Item>
                  <Link
                    aria-label="navigate to account page"
                    href={"/account"}
                    className="group flex w-full items-center rounded-md bg-transparent px-2 py-2 ui-active:bg-black/20"
                  >
                    <UserCircleIcon
                      className="mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    {session?.user?.name}
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link
                    aria-label="sign out"
                    href={"/api/auth/signout"}
                    className="group flex w-full items-center rounded-md bg-transparent px-2 py-2 ui-active:bg-black/20"
                  >
                    <ArrowLeftOnRectangleIcon
                      className="mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    Sign out
                  </Link>
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        ) : status === "loading" ? (
          <span className="px-5 py-1.5 text-sm text-white sm:text-base">
            Loading...
          </span>
        ) : (
          <Link
            aria-label="sign in"
            href={"/api/auth/signin"}
            className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 active:bg-gray-300"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
