events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    upstream python_brain {
        server ada-core:8000;
    }

    upstream go_nervous_system {
        server ada-gateway:8080;
    }

    server {
        listen 80;

        # 1. Frontend (React)
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # 2. The Brain API (Python)
        location /api/ {
            proxy_pass http://python_brain/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 3. The Nervous System (Go Websockets)
        location /ws/ {
            proxy_pass http://go_nervous_system/ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
