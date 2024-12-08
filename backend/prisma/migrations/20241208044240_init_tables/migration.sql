-- CreateEnum
CREATE TYPE "BattleType" AS ENUM ('CHALLENGE', 'OPEN', 'X');

-- CreateEnum
CREATE TYPE "MatchResult" AS ENUM ('VICTORY', 'DEFEAT', 'DRAW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "mailAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "registerDate" DATE NOT NULL,
    "cancelDate" DATE NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weapon" (
    "id" TEXT NOT NULL,
    "main" TEXT NOT NULL,
    "sub" TEXT NOT NULL,
    "special" TEXT NOT NULL,

    CONSTRAINT "Weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "battleType" "BattleType" NOT NULL,
    "matchResult" "MatchResult" NOT NULL,
    "stageId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "weaponId" TEXT NOT NULL,
    "gameDateTime" DATE NOT NULL,
    "point" INTEGER NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);
