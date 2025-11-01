FROM node:current-bullseye

WORKDIR /workspace

RUN npm install -g pnpm

RUN apt-get update && apt-get install -y \
    git \
    vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*