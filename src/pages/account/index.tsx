import { api } from "@/utils/api";
import type { Bio } from "@prisma/client";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { toast } from "react-toastify";
import type { NextPageWithLayout } from "../_app";

// external imports
import ErrorScreen from "@/components/screens/ErrorScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";
import Layout from "@/layouts/Layout";
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
        >
          {biosQuery.data.pages.map((page) =>
            page.bios.map((bio) => <BioCard bio={bio} key={bio.id} />)
          )}
          <motion.button
            aria-label="load more bios"
            className="rounded-md bg-gray-700 py-2 font-semibold text-white shadow-md transition enabled:hover:bg-gray-800 enabled:active:bg-gray-700"
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
    onSuccess: async () => {
      await apiUtils.bio.getPaginated.invalidate();
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
        className="absolute right-2 hidden rounded-full bg-red-400 p-0.5 text-white transition-colors hover:bg-red-500 active:bg-red-400 group-hover:block"
        onClick={() => void deleteBioMutation.mutate(bio.id)}
      >
        <XMarkIcon className="aspect-square w-5" aria-hidden="true" />
      </button>
    </motion.div>
  );
};
