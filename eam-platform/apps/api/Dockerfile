# build context = eam-platform root (ต้อง copy db/ เข้า image ด้วย)
FROM node:22-alpine AS build
WORKDIR /app
COPY apps/api/package*.json ./
RUN npm ci
COPY apps/api/tsconfig.json ./
COPY apps/api/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY db ./db
EXPOSE 3000
CMD ["node", "dist/main.js"]
