import { api } from "@/utils/api";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { Bio } from "@prisma/client";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { toast } from "react-toastify";
import type { NextPageWithLayout } from "../_app";

// external imports
import Layout from "@/layouts/Layout";
import ErrorScreen from "@/screens/ErrorScreen";
import LoadingScreen from "@/screens/LoadingScreen";
import { XMarkIcon } from "@heroicons/react/20/solid";

const Account: NextPageWithLayout = () => {
  const { status } = useSession();

  // get bios query
  const biosQuery = api.bio.getPaginated.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      enabled: status === "authenticated",
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // framer motion
  const container = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5,
      },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // auto-animate
  const [animationParent] = useAutoAnimate();

  if (biosQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (biosQuery.isError) {
    return <ErrorScreen error={biosQuery.error} />;
  }

  return (
    <>
      <Head>
        <title>Account | Bio Generator</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto mt-28 mb-14 flex min-h-screen max-w-2xl flex-col gap-10 px-4">
        <h1 className="text-center text-xl font-semibold text-white sm:text-3xl">
          Your copied bios
        </h1>
        <motion.div
          className="grid gap-4"
          variants={container}
          initial="hidden"
          animate="visible"
          ref={animationParent}
        >
          {biosQuery.data.pages.map((page) =>
            page.bios.map((bio) => <BioCard bio={bio} key={bio.id} />)
          )}
          <motion.button
            aria-label="load more bios"
            className="rounded-md bg-gray-700 py-2 font-semibold text-white shadow-md transition enabled:hover:bg-gray-800 enabled:active:bg-gray-700 disabled:cursor-not-allowed"
            variants={item}
            onClick={() => void biosQuery.fetchNextPage()}
            disabled={!biosQuery.hasNextPage || biosQuery.isFetchingNextPage}
          >
            {biosQuery.isFetchingNextPage
              ? "Loading..."
              : biosQuery.hasNextPage
              ? "Load more"
              : "No more bios"}
          </motion.button>
        </motion.div>
      </main>
    </>
  );
};

export default Account;

Account.getLayout = (page) => <Layout>{page}</Layout>;

const BioCard = ({ bio }: { bio: Bio }) => {
  const apiUtils = api.useContext();
  // delete bio mutation
  const deleteBioMutation = api.bio.delete.useMutation({
    onMutate: async () => {
      await apiUtils.bio.getPaginated.cancel();
      apiUtils.bio.getPaginated.setInfiniteData({ limit: 10 }, (data) => {
        if (!data) {
          return {
            pages: [],
            pageParams: [],
          };
        }
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            bios: page.bios.filter((b) => b.id !== bio.id),
          })),
        };
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // framer motion
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={item}
      className="group relative flex items-center justify-between rounded-md bg-gray-700 px-5 py-3 shadow-md ring-1 ring-gray-500 transition hover:bg-gray-800 active:bg-gray-700"
    >
      <button
        aria-label="copy bio"
        className="cursor-copy text-left text-white"
        onClick={() => {
          void navigator.clipboard.writeText(bio.bio);
          toast.success("Copied to clipboard!");
        }}
        disabled={deleteBioMutation.isLoading}
      >
        {deleteBioMutation.isLoading ? "Loading..." : bio.bio}
      </button>
      <button
        aria-label="delete bio"
        className="absolute right-2 z-10 hidden transition group-hover:block"
        onClick={() => void deleteBioMutation.mutate(bio.id)}
      >
        <XMarkIcon
          className="aspect-square w-6 text-red-400 transition-colors hover:text-red-500 active:text-red-400"
          aria-hidden="true"
        />
      </button>
    </motion.div>
  );
};
