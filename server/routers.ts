import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getClientsByUserId(ctx.user.id);
    }),

    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getClientById(input.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createClient(ctx.user.id, input.name, input.phone, input.email, input.address);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateClient(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteClient(input.id);
      }),

    uploadImage: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        imageBase64: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.imageBase64, 'base64');
        const { key, url } = await storagePut(`clients/${input.clientId}/${input.fileName}`, buffer, 'image/jpeg');
        await db.updateClient(input.clientId, { imageUrl: url });
        return { url, key };
      }),
  }),

  cases: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const clients_list = await db.getClientsByUserId(ctx.user.id);
      const all_cases = [];
      for (const client of clients_list) {
        const client_cases = await db.getCasesByClientId(client.id);
        all_cases.push(...client_cases);
      }
      return all_cases;
    }),

    getByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCasesByClientId(input.clientId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCaseById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        caseNumber: z.string().optional(),
        court: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createCase(input.clientId, ctx.user.id, input.title, input.description, input.caseNumber, input.court);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['active', 'closed', 'pending']),
      }))
      .mutation(async ({ input }) => {
        return await db.updateCase(input.id, { status: input.status });
      }),
  }),

  documents: router({
    getByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDocumentsByCaseId(input.caseId);
      }),

    upload: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        title: z.string(),
        category: z.enum(['fee_contract', 'general', 'correspondence', 'judgment']),
        fileBase64: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileBase64, 'base64');
        const { key, url } = await storagePut(`documents/${input.caseId}/${input.category}/${input.fileName}`, buffer, 'application/pdf');
        return await db.createDocument(input.caseId, input.title, input.category, url, key);
      }),
  }),

  sessions: router({
    getByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSessionsByCaseId(input.caseId);
      }),

    create: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        date: z.date(),
        description: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createSession(input.caseId, input.date, input.description, input.notes);
      }),
  }),

  judgments: router({
    getByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getJudgmentsByCaseId(input.caseId);
      }),

    create: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        date: z.date(),
        description: z.string(),
        documentUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createJudgment(input.caseId, input.date, input.description, input.documentUrl);
      }),
  }),

  analysis: router({
    analyze: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .mutation(async ({ input }) => {
        const case_data = await db.getCaseById(input.caseId);
        if (!case_data) throw new Error("Case not found");

        const prompt = `أنت محام عراقي متخصص. قم بتحليل القضية التالية:
العنوان: ${case_data.title}
الوصف: ${case_data.description}

قدم التحليل بالصيغة التالية:
1. ملخص قانوني: (ملخص مختصر للقضية)
2. المواد القانونية: (المواد العراقية ذات الصلة)
3. استراتيجية الدفاع: (الاستراتيجية المقترحة)
4. المخاطر: (المخاطر المحتملة)`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "أنت محام عراقي متخصص في القانون العراقي." },
            { role: "user", content: prompt },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const contentStr = typeof content === 'string' ? content : '';
        const lines = contentStr.split('\n');
        
        const analysis = {
          summary: lines.find((l: string) => l.includes('ملخص'))?.replace(/\d\.\s*ملخص.*:/, '').trim() || "",
          legalArticles: lines.find((l: string) => l.includes('المواد'))?.replace(/\d\.\s*المواد.*:/, '').trim() || "",
          defensStrategy: lines.find((l: string) => l.includes('استراتيجية'))?.replace(/\d\.\s*استراتيجية.*:/, '').trim() || "",
          risks: lines.find((l: string) => l.includes('المخاطر'))?.replace(/\d\.\s*المخاطر.*:/, '').trim() || "",
        };

        await db.createCaseAnalysis(input.caseId, analysis.summary, analysis.legalArticles, analysis.defensStrategy, analysis.risks);
        return analysis;
      }),

    get: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCaseAnalysisByCaseId(input.caseId);
      }),
  }),

  statistics: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getStatistics(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
