FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY web/package.json web/
RUN npm ci
COPY . .
ARG SITE_URL
RUN SITE_URL=$SITE_URL npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web/dist /usr/share/nginx/html
EXPOSE 80
