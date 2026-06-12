# Use a super light web server image
FROM nginx:alpine
# Copy a simple HTML file into the web directory
RUN echo "<h1>Hello! This is my first CD deployment!</h1>" > /usr/share/nginx/html/index.html
