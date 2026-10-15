FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY web/package.json web/
COPY admin/package.json admin/
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DB_FILE=/data/leads.db
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/server server
COPY --from=build /app/web/dist web/dist
COPY --from=build /app/admin/dist admin/dist
VOLUME /data
EXPOSE 3000
CMD ["node", "server/src/index.js"]
