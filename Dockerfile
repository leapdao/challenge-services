FROM node:latest
MAINTAINER tim.daubenschuetz@gmail.com

RUN apt-get update && apt-get -y install cron

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

# Copy the app into the container
COPY . /usr/src/event-scanner

# Run the command on container startup
CMD ["cron", "-f"]
