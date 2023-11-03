FROM node:18-alpine
RUN mkdir -p /var/www/identity
WORKDIR /var/www/identity
ADD . /var/www/identity
RUN npm install
CMD npm run build && npm run start:prod