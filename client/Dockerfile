# FROM node:alpine
# WORKDIR /app
# COPY package.json .
# RUN npm install
# COPY . .
# CMD ["npm","run","dev"]


# Dockerfile (client/)
FROM node:alpine           
WORKDIR /app

# 1) Copy only package manifest, install deps
COPY package.json package-lock.json ./
RUN npm ci                   

# 2) Copy the rest of your source
COPY . .

# 3) Expose & run dev server
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]