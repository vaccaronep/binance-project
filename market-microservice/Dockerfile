FROM node:18-alpine
RUN mkdir -p /var/www/market
WORKDIR /var/www/market
ADD . /var/www/market
RUN npm install
CMD npm run build && npm run start:prod