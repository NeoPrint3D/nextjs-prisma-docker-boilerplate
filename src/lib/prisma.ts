// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { readReplicas } from "@prisma/extension-read-replicas";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient().$extends(
    readReplicas({
      url: [process.env.DATABASE_URL_SLAVE1, process.env.DATABASE_URL_SLAVE2],
    })
  );
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient().$extends(
      readReplicas({
        url: [process.env.DATABASE_URL_SLAVE1, process.env.DATABASE_URL_SLAVE2],
      })
    );
  }
  prisma = global.prisma as any;
}

export default prisma;
