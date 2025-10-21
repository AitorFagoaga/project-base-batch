# 🚀 Production Deployment Guide

This document provides a comprehensive guide to deploying the Meritocratic Launchpad to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
- [Post-Deployment Verification](#post-deployment-verification)
- [Security Considerations](#security-considerations)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

✅ **Node.js 18+** installed  
✅ **npm or yarn** package manager  
✅ **Git** for version control  
✅ **Contracts deployed** on Base Sepolia (or your target network)  
✅ **Vercel account** (for recommended deployment)  

### Optional but Recommended

- WalletConnect Project ID (from https://cloud.walletconnect.com)
- BaseScan API key (for contract verification)
- Custom domain name

---

## Pre-Deployment Checklist

### 1. Build Verification

Ensure the project builds successfully locally:

```bash
# Install dependencies
npm install

# Build the frontend
npm run app:build

# Verify build completed without errors
```

### 2. Contract Verification

Verify your smart contracts are deployed and accessible:

```bash
# Check deployment info
cat deployments/base-sepolia.json

# Verify contracts on BaseScan
npm run contracts:verify --network base-sepolia
```

### 3. Environment Variables

Create your production environment configuration:

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

---

## Environment Configuration

### Required Variables

The following contract addresses must be configured:

```env
# Contract addresses on Base Sepolia
NEXT_PUBLIC_REPUTATION_ADDRESS=0x4bFEd65431969Ef98D6A2e294bB5b5da149D1C6F
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0xD478494B0960Fc0198E12F57c40951825B03dAE5
NEXT_PUBLIC_EVENT_MANAGER_ADDRESS=0x4DB2EEdDbeF88165366070D72EdeA2E293cd4993
NEXT_PUBLIC_USER_PROFILE_ADDRESS=0x5EAD5409fA791a2FdBf090187BC202B861F88D41
```

**Note:** The application includes fallback defaults from the deployment file, so it will work even without these explicitly set. However, setting them explicitly is recommended for production.

### Optional Variables

```env
# Network (defaults to Base Sepolia)
NEXT_PUBLIC_CHAIN_ID=84532

# WalletConnect (improves wallet connection UX)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Contract Deployment Variables (Development Only)

**⚠️ NEVER commit these to version control!**

```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key_here
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

#### Via Vercel Dashboard

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `app`
   - ✅ Check "Include source files outside of the Root Directory in the Build Step"

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add each `NEXT_PUBLIC_*` variable
   - Apply to: Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-project.vercel.app`

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to app directory
cd app

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_REPUTATION_ADDRESS production
vercel env add NEXT_PUBLIC_LAUNCHPAD_ADDRESS production
vercel env add NEXT_PUBLIC_EVENT_MANAGER_ADDRESS production
vercel env add NEXT_PUBLIC_USER_PROFILE_ADDRESS production
```

### Option 2: Self-Hosted

#### Build and Start

```bash
# Build the application
npm run app:build

# Start production server
npm run app:start

# Server will run on http://localhost:3000
```

#### Using PM2 for Process Management

```bash
# Install PM2
npm install -g pm2

# Start with PM2
cd app
pm2 start npm --name "launchpad" -- start

# Configure PM2 to restart on reboot
pm2 startup
pm2 save
```

#### Using Docker

```dockerfile
# Dockerfile (place in /app directory)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY .next ./.next
COPY public ./public
COPY next.config.js ./

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t launchpad .
docker run -p 3000:3000 -e NEXT_PUBLIC_REPUTATION_ADDRESS=0x... launchpad
```

### Option 3: Other Platforms

The application is compatible with:
- **Netlify** (configure build directory to `app/.next`)
- **Railway** (detects Next.js automatically)
- **Render** (use Next.js preset)
- **AWS Amplify** (configure build settings)

---

## Post-Deployment Verification

### 1. Health Check

Visit your deployed URL and verify:

- ✅ Homepage loads without errors
- ✅ Wallet connection works (MetaMask, Coinbase Wallet, etc.)
- ✅ Network guard prompts for Base Sepolia
- ✅ Project list displays (or shows empty state)
- ✅ Create project page is accessible
- ✅ Reputation page loads

### 2. Functional Testing

Test core functionality:

```markdown
- [ ] Connect wallet to Base Sepolia
- [ ] View projects (if any exist)
- [ ] Create a new project
- [ ] Fund a project (with test ETH)
- [ ] Check reputation display
- [ ] Test boost functionality
- [ ] Verify transaction links to BaseScan work
```

### 3. Performance Check

Use browser developer tools:

- Check Network tab for failed requests
- Verify Console has no critical errors
- Test on mobile device (responsive design)
- Check load time (should be < 3 seconds)

---

## Security Considerations

### Smart Contracts

✅ **Contracts are deployed and immutable**  
✅ **Using OpenZeppelin security libraries**  
✅ **ReentrancyGuard on fund claims**  
✅ **Access control for Genesis awards**  

### Frontend Security

#### Environment Variables

- ✅ All sensitive config in environment variables
- ✅ No private keys in frontend code
- ✅ Contract addresses are public (blockchain)

#### Network Security

- ✅ HTTPS enforced by Vercel
- ✅ Content Security Policy headers
- ✅ Next.js security headers enabled

#### Wallet Security

- ✅ Users control their own wallets
- ✅ No custody of user funds
- ✅ Transactions require user approval

### Recommendations

1. **Never commit `.env` files** to version control
   ```bash
   # Verify .env is in .gitignore
   grep "^\.env$" .gitignore
   ```

2. **Regularly update dependencies**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Monitor for vulnerabilities**
   - Enable Dependabot on GitHub
   - Review security alerts
   - Update dependencies promptly

4. **Rate Limiting** (if self-hosting)
   ```javascript
   // Consider adding rate limiting middleware
   // to prevent API abuse
   ```

---

## Monitoring and Maintenance

### Vercel Analytics

Enable built-in analytics:
1. Go to Project → Analytics
2. View real-time metrics:
   - Page views
   - Unique visitors
   - Performance (Web Vitals)
   - Geographic distribution

### Error Tracking

Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Datadog** for comprehensive monitoring

### Logs

View deployment logs:
```bash
# Via Vercel CLI
vercel logs <deployment-url>

# Or in Vercel Dashboard
# Deployments → Latest → View Function Logs
```

### Uptime Monitoring

Set up monitoring with:
- **UptimeRobot** (free, 5-min checks)
- **Pingdom** (detailed monitoring)
- **Better Uptime** (status pages)

---

## Troubleshooting

### Build Fails

**Error**: `Type error` or `Failed to compile`

**Solution**:
```bash
# Clear build cache
rm -rf app/.next
rm -rf node_modules
npm install
npm run app:build
```

### Environment Variables Not Loading

**Error**: Contract interactions fail

**Solution**:
- Verify variables are set in Vercel dashboard
- Ensure variables start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check browser console for actual addresses being used

### Wallet Connection Issues

**Error**: "Network not supported" or connection fails

**Solution**:
- Verify `NEXT_PUBLIC_CHAIN_ID=84532`
- Check user is on Base Sepolia network
- Clear browser cache
- Try different wallet (MetaMask, Coinbase, WalletConnect)

### Contract Read/Write Failures

**Error**: Transaction reverts or reads fail

**Solution**:
- Verify contract addresses are correct
- Check contracts are deployed on correct network
- Ensure Base Sepolia RPC is responding
- Verify user has Base Sepolia ETH

### Slow Performance

**Issue**: Pages load slowly

**Solution**:
- Check RPC endpoint performance
- Consider using Alchemy or Infura for RPC
- Verify images are optimized
- Check Network tab for slow requests
- Enable Vercel Edge caching

### MetaMask SDK Warnings

**Issue**: Console warnings about MetaMask SDK

**Solution**: These are harmless and suppressed in Next.js config:
```javascript
// next.config.js already configured to suppress these
webpack: (config) => {
  config.ignoreWarnings = [
    { module: /@react-native-async-storage/ },
  ];
}
```

---

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run app:build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Rollback Procedure

If you need to rollback a deployment:

### Vercel

1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Self-Hosted

```bash
# Using PM2
pm2 stop launchpad
git checkout <previous-commit>
npm run app:build
pm2 restart launchpad
```

---

## Support Resources

- **Base Documentation**: https://docs.base.org
- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **wagmi Documentation**: https://wagmi.sh
- **RainbowKit Documentation**: https://rainbowkit.com/docs

---

## Maintenance Schedule

### Daily
- Monitor error logs
- Check uptime status

### Weekly
- Review analytics
- Check for dependency updates
- Test critical user flows

### Monthly
- Security audit
- Performance optimization review
- User feedback review

---

## Production Checklist

Use this checklist before going live:

```markdown
### Pre-Launch
- [ ] All contracts deployed and verified on BaseScan
- [ ] Environment variables configured
- [ ] Build succeeds without errors
- [ ] All pages load correctly
- [ ] Wallet connection works
- [ ] Transactions work end-to-end
- [ ] Responsive design tested on mobile
- [ ] Error handling tested
- [ ] Loading states work correctly

### Security
- [ ] No private keys in code
- [ ] .env not committed to Git
- [ ] HTTPS enforced
- [ ] Contract addresses correct
- [ ] Dependencies audited

### Documentation
- [ ] README updated with live URL
- [ ] Deployment info documented
- [ ] Known issues documented
- [ ] Support contact information provided

### Monitoring
- [ ] Analytics configured
- [ ] Error tracking setup
- [ ] Uptime monitoring active
- [ ] Logs accessible

### Performance
- [ ] Initial load < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Images optimized
- [ ] No console errors

### Final Steps
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate active
- [ ] Backup plan documented
- [ ] Team notified
- [ ] Go live! 🚀
```

---

**Ready for Production!** 🎉

Your Meritocratic Launchpad is now production-ready. Follow this guide to deploy with confidence.

For questions or issues, please open an issue on GitHub or contact the development team.

---

*Last Updated: October 2025*
*Version: 1.0.0*
