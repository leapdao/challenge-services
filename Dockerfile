FROM node:lts-alpine
MAINTAINER tim.daubenschuetz@gmail.com

ARG BUILD_DEPS="git g++ cmake make python2"
RUN apk add --no-cache --update --virtual build_deps $BUILD_DEPS

# Copy hello-cron file to the cron.d directory
COPY ./config/crontab /etc/cron.d/crontab

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/crontab

# Apply cron job
RUN crontab /etc/cron.d/crontab

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Create work directory for the event scanner app
WORKDIR /usr/src/event-scanner

# Run npm install on the node project
COPY package*.json ./
RUN npm i

# Delete build-deps to shrink package size
RUN apk del build_deps

# Copy the app into the container
COPY . /usr/src/event-scanner

# Run the command on container startup
CMD ["crond", "-f"]
