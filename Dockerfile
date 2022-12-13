FROM node:alpine AS backend
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

CMD ["sh", "-c", "npm run migrate:up && npm run start:prod"]