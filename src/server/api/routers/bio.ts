import { PLATFORM, VIBE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const bioRounter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const bios = await ctx.prisma.bio.findMany();
    return bios;
  }),

  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const bio = await ctx.prisma.bio.findUnique({
      where: {
        id: input,
      },
    });
    return bio;
  }),

  create: protectedProcedure
    .input(
      z.object({
        bio: z.string(),
        vibe: z.nativeEnum(VIBE),
        platform: z.nativeEnum(PLATFORM),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const bioExists = await ctx.prisma.bio.findFirst({
        where: {
          bio: input.bio,
          vibe: input.vibe,
          platform: input.platform,
          userId: ctx.session.user.id,
        },
      });
      if (bioExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bio already exists",
        });
      }
      const bio = await ctx.prisma.bio.create({
        data: {
          bio: input.bio,
          vibe: input.vibe,
          platform: input.platform,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
      return bio;
    }),

  delete: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const bio = await ctx.prisma.bio.delete({
      where: {
        id: input,
      },
    });
    return bio;
  }),

  increaseBioCount: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const firstBioCount = await ctx.prisma.bioCount.findFirst();
      if (!firstBioCount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bio count not found",
        });
      }
      const bioCount = await ctx.prisma.bioCount.update({
        where: {
          id: firstBioCount.id,
        },
        data: {
          count: {
            increment: input,
          },
        },
      });
      return bioCount;
    }),

  getBioCount: publicProcedure.query(async ({ ctx }) => {
    const bioCount = await ctx.prisma.bioCount.findFirst();
    return bioCount;
  }),
});
