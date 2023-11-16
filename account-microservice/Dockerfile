FROM node:18-alpine
RUN mkdir -p /var/www/account
WORKDIR /var/www/account
ADD . /var/www/account
RUN npm install
CMD npm run build && npm run start:prod