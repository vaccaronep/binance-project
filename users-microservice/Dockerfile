FROM node:18-alpine
RUN mkdir -p /var/www/users
WORKDIR /var/www/users
ADD . /var/www/users
RUN npm install
CMD npm run build && npm run start:prod