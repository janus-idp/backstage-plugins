FROM registry.access.redhat.com/ubi8/nodejs-16

USER root
WORKDIR /app
COPY . /app/

RUN npm install --global yarn

RUN yarn install

CMD ["yarn", "dev"]
