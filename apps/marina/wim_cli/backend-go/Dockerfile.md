# Build Stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod.md ./go.mod
# Copy sum file if it exists, otherwise ignore (for manual setup without go.sum initially)
# COPY go.sum ./ 

RUN go mod download || echo "Skipping go.sum check"

COPY main.go.md ./main.go

RUN go build -o gateway main.go

# Run Stage
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/gateway .

EXPOSE 8080

CMD ["./gateway"]
