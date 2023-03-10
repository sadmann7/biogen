import { PLATFORM, VIBE } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { api } from "../utils/api";
import type { NextPageWithLayout } from "./_app";

// external imports
import CountUp from "@/components/CountUp";
import SelectBox from "@/components/SelectBox";
import Layout from "@/layouts/Layout";
import { FaGithub } from "react-icons/fa";

type Inputs = {
  bio: string;
  vibe: VIBE;
  platform: PLATFORM;
};

const Home: NextPageWithLayout = () => {
  const { status } = useSession();
  const apiUtils = api.useContext();
  const vibes = typeof VIBE === "object" ? Object.values(VIBE) : [];
  const [vibe, setVibe] = useState<VIBE>("PROFESSIONAL");
  const platforms = typeof PLATFORM === "object" ? Object.values(PLATFORM) : [];
  const [platform, setPlatform] = useState<PLATFORM>("FACEBOOK");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [generatedBios, setGeneratedBios] = useState<string>("");

  // create bio mutation
  const createBioMutation = api.bio.create.useMutation({
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
          pages: data.pages.map((page) => {
            return {
              ...page,
              bios: page.bios.map((bio) => {
                return {
                  ...bio,
                  isDeleted: true,
                };
              }),
            };
          }),
        };
      });
    },
    onError: (err) => {
      // toast.error(err.message);
      console.log(err);
    },
  });

  // get bioCount query
  const bioCountQuery = api.bio.getBioCount.useQuery();

  // increase bioCount mutation
  const increaseBioCountMutation = api.bio.increaseBioCount.useMutation({
    onSuccess: async () => {
      await apiUtils.bio.getBioCount.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // react-hook-form
  const { register, handleSubmit, control } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const prompt =
      data.vibe === VIBE.PROFESSIONAL
        ? `Generate 2 professional ${
            data.platform
          } bios with no hashtags and clearly labeled "1." and "2.". Make sure each generated bio is at least 14 words and at max 20 words and base them on this context: ${
            data.bio
          }${data.bio.slice(-1) === "." ? "" : "."}`
        : data.vibe === VIBE.AESTHETIC
        ? `Generate 2 aesthetic ${
            data.platform
          } bios with no hashtags and clearly labeled "1." and "2.". Make sure each generated bio is at least 14 words and at max 20 words. Also make sure to use some uncommon aesthetic words and 1 to 4 emojis and base them on this context: ${
            data.bio
          }${data.bio.slice(-1) === "." ? "" : "."}`
        : `Generate 2 funny ${
            data.platform
          } bios with no hashtags and clearly labeled "1." and "2.". Make sure there is a joke in there and it's a little ridiculous. Make sure each generated bio is at max 20 words and base it on this context: ${
            data.bio
          }${data.bio.slice(-1) === "." ? "" : "."}`;

    setIsLoading(true);
    setGeneratedBios("");
    setVibe(data.vibe);
    setPlatform(data.platform);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });
    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const responseData = response.body;
    if (!responseData) return;

    const reader = responseData.getReader();
    const decoder = new TextDecoder();

    while (!isDone) {
      const { done, value } = await reader.read();
      if (done) {
        setIsDone(true);
        increaseBioCountMutation.mutate(2);
        break;
      }
      const decodedValue = decoder.decode(value);
      setGeneratedBios((prev) => prev + decodedValue);
    }

    setIsDone(false);
    setIsLoading(false);
  };

  // scroll to the generated bios when the form is submitted
  const biogenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!biogenRef.current || generatedBios.length === 0) return;
    biogenRef.current.scrollIntoView({ behavior: "smooth" });
  }, [generatedBios]);

  return (
    <>
      <Head>
        <title>Bio Generator</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto mt-32 mb-14 flex max-w-2xl flex-col gap-10 px-4">
        <div className="grid gap-5">
          <a
            aria-label="navigate to github repository"
            href="https://github.com/sadmann7/biogen"
            target="_blank"
            rel="noreferrer"
            className="mx-auto flex w-fit items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-md ring-1 ring-gray-500 transition-colors hover:bg-gray-300 active:bg-gray-100"
          >
            <FaGithub className="mr-1 inline-block" size={18} />
            <span>Star on GitHub</span>
          </a>
          <div className="grid place-items-center gap-5">
            <h1 className="w-full text-center text-3xl font-bold text-white sm:text-5xl">
              Generate your social media bios with AI
            </h1>
            <span className="text-center text-base text-gray-300 sm:text-lg">
              {bioCountQuery.data?.count ? (
                <CountUp end={bioCountQuery.data.count} />
              ) : (
                0
              )}
              {` bios generated so far`}
            </span>
          </div>
        </div>
        <form
          aria-label="generate bio from"
          className="grid w-full gap-5"
          onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
        >
          <fieldset className="grid gap-3">
            <label htmlFor="bio" className="text-base text-white">
              <span className="rounded-full text-gray-400">1.</span> Copy your
              current bio (or write a few sentences about yourself)
            </label>
            <textarea
              id="bio"
              className="w-full rounded-md border-gray-400 bg-transparent px-4 pt-2.5 pb-10 text-base text-white transition-colors placeholder:text-gray-400"
              placeholder="e.g. Junor web developer, posting about web development, tech, and more."
              {...register("bio")}
            />
          </fieldset>
          <fieldset className="grid gap-3">
            <label htmlFor="vibe" className="text-base text-white">
              <span className="rounded-full text-gray-400">2.</span> Select your
              vibe
            </label>
            <SelectBox
              id="vibe"
              control={control}
              name="vibe"
              options={vibes}
              selected={vibe}
              setSelected={setVibe}
            />
          </fieldset>
          <fieldset className="grid gap-3">
            <label htmlFor="platform" className="text-base text-white">
              <span className="rounded-full text-gray-400">3.</span> Select your
              social media platform
            </label>
            <SelectBox
              id="platform"
              control={control}
              name="platform"
              options={platforms}
              selected={platform}
              setSelected={setPlatform}
            />
          </fieldset>
          <button
            aria-label="generate your bio"
            className="mt-1.5 w-full rounded-md bg-gray-100 px-4 py-2 text-base font-medium transition-colors enabled:hover:bg-gray-300 enabled:active:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Generate your bio"}
          </button>
        </form>
        {generatedBios ? (
          <AnimatePresence mode="wait">
            <motion.div ref={biogenRef} className="grid gap-8">
              <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
                Your generated bios
              </h2>
              <div className="grid place-items-center gap-6">
                {generatedBios
                  .split(/1\.|2\./g)
                  .filter((bio) => bio !== "")
                  .map((generatedBio) => {
                    return (
                      <button
                        aria-label="copy generated bio to clipboard"
                        key={generatedBio}
                        className="cursor-copy rounded-md bg-gray-700 px-5 py-3 text-white shadow-md ring-1 ring-gray-500 transition hover:bg-gray-800 active:bg-gray-700"
                        onClick={() => {
                          void navigator.clipboard.writeText(generatedBio);
                          toast.success("Copied to clipboard");
                          status === "authenticated"
                            ? createBioMutation.mutate({
                                bio: generatedBio,
                                vibe,
                                platform,
                              })
                            : null;
                        }}
                      >
                        {generatedBio}
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
      </main>
    </>
  );
};

export default Home;

Home.getLayout = (page) => <Layout>{page}</Layout>;
