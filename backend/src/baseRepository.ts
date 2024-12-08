import { PrismaClient } from "@prisma/client";

class BaseRepository { 
  client = new PrismaClient()
}

export default BaseRepository
