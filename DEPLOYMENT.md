# Deployment Guide - Agent Swamps

This guide covers deployment options for the Agent Swamps multi-agent system.

> Current baseline stack: **Fluent UI 2 React frontend (`temp_app`)** + **.NET 8 Microsoft Semantic Kernel backend (`backend-dotnet`)**.

## Prerequisites

- Node.js 18+ installed
- API keys for AI providers (Google Gemini recommended)
- (Optional) Docker and Docker Compose for containerized deployment

## Local Development Deployment

### 1. Clone and Setup

```bash
git clone https://github.com/rizwan-saddal/Agency.git
cd Agency
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your preferred editor
```

Required environment variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:3000

### 4. Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# Get system stats
curl http://localhost:3000/api/system/stats

# List agents
curl http://localhost:3000/api/agents
```

## Production Deployment

### Option 0: GCP Cloud Run (Recommended)

The repository includes:
- `backend-dotnet/Dockerfile`
- `temp_app/Dockerfile`
- `cloudbuild.yaml` (build and deploy both services)

Deploy both services from Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml --substitutions=_REGION=us-central1
```

This produces two Cloud Run services:
- `agent-swamps-backend` (port 8080)
- `agent-swamps-frontend` (port 80)

### Option 1: Node.js Production Server

#### 1. Build the Application

```bash
cd backend
npm install --production
npm run build
```

#### 2. Set Production Environment

```bash
# Create production .env
cp .env.example .env

# Edit with production values
nano .env
```

```env
GEMINI_API_KEY=your_production_api_key
PORT=3000
NODE_ENV=production
```

#### 3. Start with PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/index.js --name agent-swamps

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 4. Configure Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

#### 2. Create .dockerignore

Create `backend/.dockerignore`:

```
node_modules
dist
.env
.git
*.log
```

#### 3. Build and Run

```bash
# Build image
docker build -t agent-swamps-backend:latest ./backend

# Run container
docker run -d \
  --name agent-swamps \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_key_here \
  -e NODE_ENV=production \
  agent-swamps-backend:latest
```

#### 4. Docker Compose (Full Stack)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    restart: unless-stopped
    
  frontend:
    build: ./temp_app
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  # Optional: Redis for caching (future enhancement)
  # redis:
  #   image: redis:7-alpine
  #   ports:
  #     - "6379:6379"
  #   volumes:
  #     - redis_data:/data
  #   restart: unless-stopped

# volumes:
#   redis_data:
```

Run with:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Cloud Platform Deployment

#### Heroku

1. Create `Procfile` in backend directory:
```
web: node dist/index.js
```

2. Deploy:
```bash
heroku create agent-swamps
heroku config:set GEMINI_API_KEY=your_key_here
git push heroku main
```

#### AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Clone and setup:
```bash
git clone https://github.com/rizwan-saddal/Agency.git
cd Agency/backend
npm install
npm run build
```

4. Use PM2 and configure security groups to allow port 3000

#### Google Cloud Run

1. Create `backend/Dockerfile` (see Docker section)

2. Deploy:
```bash
gcloud run deploy agent-swamps \
  --source ./backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here
```

#### Azure App Service

1. Create App Service
2. Configure deployment:
```bash
az webapp up \
  --name agent-swamps \
  --runtime "NODE|18-lts" \
  --sku B1
```

3. Set environment variables in Azure Portal

## Environment Variables

### Required

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

### Optional

```env
PORT=3000                    # Default: 3000
NODE_ENV=production          # Default: development

# Future database integration
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Additional model providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_BASE_URL=http://localhost:11434
```

## Monitoring and Logging

### Production Logging

The system uses console logging by default. For production, consider:

1. **Winston/Pino for structured logging**
2. **Log aggregation**: Datadog, New Relic, or ELK stack
3. **Error tracking**: Sentry for error monitoring

### Health Monitoring

Set up monitoring for:

- `/health` endpoint
- API response times
- Agent success rates
- Model provider availability

### Metrics

Key metrics to monitor:

- Active agents count
- Task queue depth
- Average task completion time
- Success/failure rates
- Model API latency

## Scaling Considerations

### Horizontal Scaling

The system can be scaled horizontally by:

1. **Multiple orchestrator instances**: Use shared state (Redis)
2. **Load balancer**: Distribute requests across instances
3. **Agent pool distribution**: Agents across multiple nodes

### Vertical Scaling

For single-instance scaling:

- Increase node memory for more concurrent agents
- Optimize model provider request batching
- Implement caching for common requests

## Security Best Practices

1. **API Keys**: Never commit to version control
2. **HTTPS**: Use SSL/TLS in production
3. **Rate Limiting**: Implement API rate limits
4. **Authentication**: Add JWT or OAuth for API access
5. **CORS**: Configure allowed origins properly
6. **Input Validation**: Validate all task requests
7. **Secrets Management**: Use AWS Secrets Manager, Azure Key Vault, etc.

## Backup and Recovery

### Configuration Backup

- Store environment variables securely
- Document custom agent configurations
- Version control all code changes

### Data Backup (Future)

When database is added:
- Regular PostgreSQL backups
- Redis persistence configuration
- Vector database backups

## Troubleshooting

### Common Issues

1. **"No providers available"**
   - Check GEMINI_API_KEY is set
   - Verify API key is valid
   - Check network connectivity

2. **"No capable agents available"**
   - Ensure agents are registered
   - Check agent capabilities match task requirements
   - Verify agents are in IDLE status

3. **High latency**
   - Check model provider response times
   - Implement caching for repeated requests
   - Scale horizontally

4. **Port already in use**
   - Change PORT in .env
   - Kill process using the port
   - Use different port number

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development npm run dev
```

## Performance Optimization

1. **Caching**: Implement Redis for model responses
2. **Connection Pooling**: For database connections
3. **Request Batching**: Batch model API requests
4. **CDN**: Serve static assets via CDN
5. **Load Balancing**: Distribute across multiple instances

## Maintenance

### Regular Tasks

- **Update dependencies**: `npm update`
- **Security patches**: `npm audit fix`
- **Monitor logs**: Check for errors
- **Review metrics**: Analyze performance
- **API key rotation**: Rotate keys periodically

### Upgrade Process

1. Test in development
2. Create backup
3. Deploy to staging
4. Verify functionality
5. Deploy to production
6. Monitor for issues

## Support and Resources

- Documentation: See `/docs` directory
- Architecture: `ARCHITECTURE.md`
- Class Diagrams: `CLASS_DIAGRAMS.md`
- Flow Diagrams: `FLOW_DIAGRAMS.md`
- API Reference: `backend/README.md`

## License

MIT License - See LICENSE file for details
