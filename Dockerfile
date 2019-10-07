FROM node:11
ENV NODE_ENV=development

RUN useradd --user-group --create-home --shell /bin/false app &&\
    npm install --global npm

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/ 

#WORKDIR /usr/local/src
#COPY package.json /usr/local/src/package.json
#ADD . .

WORKDIR /opt/app
ADD . /opt/app

RUN npm install
EXPOSE 8080

CMD ["npm","start"]
