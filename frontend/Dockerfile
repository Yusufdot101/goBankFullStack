FROM nginx:alpine

# remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# copy your frontend files (HTML/CSS/JS or build folder)
COPY ./ /usr/share/nginx/html

# expose default nginx port
EXPOSE 80

# nginx runs automatically; no need for CMD
