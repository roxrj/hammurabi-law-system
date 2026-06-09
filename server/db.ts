import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, cases, documents, sessions, judgments, caseAnalyses } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Clients
export async function createClient(userId: number, name: string, phone?: string, email?: string, address?: string, imageUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(clients).values({
    userId,
    name,
    phone,
    email,
    address,
    imageUrl,
  });
  return result;
}

export async function getClientsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clients).where(eq(clients.userId, userId));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateClient(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(clients).where(eq(clients.id, id));
}

// Cases
export async function createCase(clientId: number, userId: number, title: string, description?: string, caseNumber?: string, court?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(cases).values({
    clientId,
    userId,
    title,
    description,
    caseNumber,
    court,
  });
}

export async function getCasesByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cases).where(eq(cases.clientId, clientId));
}

export async function getCaseById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateCase(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(cases).set(data).where(eq(cases.id, id));
}

// Documents
export async function createDocument(caseId: number, title: string, category: string, fileUrl: string, fileKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(documents).values({
    caseId,
    title,
    category: category as any,
    fileUrl,
    fileKey,
  });
}

export async function getDocumentsByCaseId(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(documents).where(eq(documents.caseId, caseId));
}

// Sessions
export async function createSession(caseId: number, date: Date, description?: string, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(sessions).values({
    caseId,
    date,
    description,
    notes,
  });
}

export async function getSessionsByCaseId(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sessions).where(eq(sessions.caseId, caseId));
}

// Judgments
export async function createJudgment(caseId: number, date: Date, description: string, documentUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(judgments).values({
    caseId,
    date,
    description,
    documentUrl,
  });
}

export async function getJudgmentsByCaseId(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(judgments).where(eq(judgments.caseId, caseId));
}

// Case Analysis
export async function createCaseAnalysis(caseId: number, summary: string, legalArticles?: string, defensStrategy?: string, risks?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(caseAnalyses).values({
    caseId,
    summary,
    legalArticles,
    defensStrategy,
    risks,
  });
}

export async function getCaseAnalysisByCaseId(caseId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(caseAnalyses).where(eq(caseAnalyses.caseId, caseId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Statistics
export async function getStatistics(userId: number) {
  const db = await getDb();
  if (!db) return { totalClients: 0, totalCases: 0, activeCases: 0, totalDocuments: 0 };
  
  const clientsCount = await db.select({ count: clients.id }).from(clients).where(eq(clients.userId, userId));
  const casesCount = await db.select({ count: cases.id }).from(cases).where(eq(cases.userId, userId));
  const docsCount = await db.select({ count: documents.id }).from(documents);
  
  return {
    totalClients: clientsCount.length,
    totalCases: casesCount.length,
    activeCases: casesCount.length,
    totalDocuments: docsCount.length,
  };
}
