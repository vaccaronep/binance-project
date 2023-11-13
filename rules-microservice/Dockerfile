FROM node:18-alpine
RUN mkdir -p /var/www/rules
WORKDIR /var/www/rules
ADD . /var/www/rules
RUN npm install
CMD npm run build && npm run start:prod