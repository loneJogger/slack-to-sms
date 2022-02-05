FROM node:14
RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN adduser app
COPY . .
RUN npm install
RUN npm install pm2 -g
RUN chown -R app /opt/app
USER app
EXPOSE 5000
CMD ["npm", "run", "pm2"]
