# Staging Environment Setup

## Nhánh Stage
Nhánh `stage` đã được tạo để deploy staging environment.

## API Configuration
- **Development**: `http://localhost:8080` (`.env.development`)
- **Staging**: `https://api-stg.ainnect.me` (`.env.staging`)
- **Production**: `https://api.ainnect.me` (`.env.production`)

## Scripts

### Development
```bash
npm start
# hoặc
npm run start
```
Sử dụng `.env.development` → connect đến `http://localhost:8080`

### Staging
```bash
npm run start:staging
```
Sử dụng `.env.staging` → connect đến `https://api-stg.ainnect.me`

### Build Staging
```bash
npm run build:staging
```
Build production-ready code với staging API endpoint

### Production
```bash
npm run build
```
Build production-ready code với production API endpoint

## Deployment Flow

1. **Development** → commit & push to `main`/`develop` branch
2. **Staging** → commit & push to `stage` branch
   - CI/CD sẽ build với: `npm run build:staging`
   - Deploy đến staging server
   - Test trên: `https://staging.ainnect.me` (hoặc subdomain tương tự)
3. **Production** → merge `stage` to `main` hoặc create release tag
   - CI/CD sẽ build với: `npm run build`
   - Deploy đến production server

## Environment Variables

### `.env.staging` (mới tạo)
```
REACT_APP_API_URL=https://api-stg.ainnect.me
```

### `.env.production` (đã có)
```
REACT_APP_API_URL=https://api.ainnect.me
```

### `.env.development` (đã có)
```
REACT_APP_API_URL=http://localhost:8080
```

## Git Branches

- `main`/`master`: Production code
- `stage`: Staging environment
- `develop`: Development environment
- Feature branches: `feature/*`, `fix/*`, etc.

## CI/CD Configuration

Nếu dùng GitHub Actions, cần update `.github/workflows/deploy.yml`:

```yaml
# Deploy to staging when push to stage branch
on:
  push:
    branches:
      - stage

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Build staging
        run: npm run build:staging
      - name: Deploy to staging server
        # Deploy logic here
```
