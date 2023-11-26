FROM node:18-alpine
RUN mkdir -p /var/www/permissions
WORKDIR /var/www/permissions
ADD . /var/www/permissions
RUN npm install
CMD npm run build && npm run start:prod