FROM node:18-alpine
RUN mkdir -p /var/www/orders
WORKDIR /var/www/orders
ADD . /var/www/orders
RUN npm install
CMD npm run build && npm run start:prod