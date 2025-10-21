# 🔒 Security Best Practices

This document outlines security considerations and best practices for the Meritocratic Launchpad platform.

## Table of Contents

- [Smart Contract Security](#smart-contract-security)
- [Frontend Security](#frontend-security)
- [Deployment Security](#deployment-security)
- [Wallet Security](#wallet-security)
- [Monitoring and Incident Response](#monitoring-and-incident-response)

---

## Smart Contract Security

### Architecture

The platform uses two main smart contracts:

1. **Reputation.sol** - Two-layer reputation system
2. **Launchpad.sol** - All-or-nothing crowdfunding

### Security Features

✅ **OpenZeppelin Libraries**
- Uses audited, battle-tested contract libraries
- `AccessControl` for admin permissions
- `ReentrancyGuard` for reentrancy protection

✅ **Access Control**
- Genesis awards require `ADMIN_ROLE`
- Only project creators can claim funds
- Users cannot boost themselves

✅ **Input Validation**
- Zero-amount checks on transfers
- Deadline validation (1-365 days)
- Minimum goal validation (0.01 ETH)
- Cooldown enforcement on boosts (24 hours)

✅ **Safe Math**
- Solidity 0.8.20 built-in overflow protection
- No manual SafeMath required

### Contract Interactions

#### Read Operations (No Risk)
```solidity
// These operations only read blockchain state
reputationOf(address)
boostPower(address)
getProject(uint256)
projectCount()
```

#### Write Operations (Require User Approval)
```solidity
// All state-changing operations require:
// 1. User wallet signature
// 2. Transaction gas payment
// 3. On-chain execution

createProject(...)      // Creates new project
fundProject(...)        // Sends ETH to contract
claimFunds(...)         // Withdraws ETH (if goal reached)
boost(address)          // Awards reputation points
awardGenesis(...)       // Admin only - awards reputation
```

### Known Limitations (By Design)

⚠️ **No Refund Mechanism (MVP)**
- Once project goal is reached, funds cannot be refunded
- Backers should only fund projects they trust
- Future versions will add refund capability

⚠️ **Genesis Awards are Centralized**
- Only admin(s) can award Genesis reputation
- This is intentional for quality control
- Future versions may add DAO governance

⚠️ **No Project Cancellation**
- Once created, projects cannot be deleted
- Creators should test thoroughly before creating
- Future versions will add cancellation feature

---

## Frontend Security

### Environment Variables

✅ **Proper Configuration**
```bash
# ✅ Good: Public variables (safe to expose)
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_REPUTATION_ADDRESS=0x...
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0x...

# ❌ Bad: Never put private keys in frontend!
# NEXT_PUBLIC_PRIVATE_KEY=... # NEVER DO THIS!
```

**Why `NEXT_PUBLIC_` prefix?**
- Next.js only exposes variables with this prefix to the browser
- Prevents accidental exposure of backend secrets
- Contract addresses are public (on blockchain) so safe to expose

### No Server-Side Secrets

The frontend is a static site with no backend:
- No API keys stored in frontend code
- No private keys in the application
- All wallet operations use user's browser wallet

### HTTPS Only

✅ **Vercel enforces HTTPS automatically**
- All traffic encrypted in transit
- Prevents man-in-the-middle attacks
- SSL certificates auto-renewed

### Content Security Policy

Next.js includes security headers:
```javascript
// next.config.js (already configured)
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        }
      ]
    }
  ]
}
```

### XSS Protection

✅ **React automatically escapes user input**
- All user-generated content is sanitized
- No `dangerouslySetInnerHTML` used
- Project titles, descriptions are escaped

### Dependency Security

```bash
# Check for known vulnerabilities
npm audit

# Fix low-severity issues automatically
npm audit fix

# Review high-severity issues manually
npm audit fix --force  # Only if safe to do
```

**Current Status**: 32 low severity vulnerabilities in dev dependencies (hardhat, walletconnect). These are acceptable as they don't affect production.

---

## Deployment Security

### Never Commit Secrets

❌ **Never commit these files:**
```bash
.env
.env.local
.env.production
private_keys.txt
secrets.json
```

✅ **Verify with:**
```bash
# Check .gitignore
cat .gitignore | grep .env

# Check git history doesn't have secrets
git log --all --full-history -- .env
```

### Environment Variables in Production

**For Vercel:**
1. Never commit `.env` to Git
2. Add variables in Vercel Dashboard:
   - Project → Settings → Environment Variables
3. Use separate values for:
   - Production
   - Preview
   - Development

**For Self-Hosted:**
```bash
# Use system environment variables
export NEXT_PUBLIC_REPUTATION_ADDRESS=0x...

# Or use a secrets manager
# - AWS Secrets Manager
# - HashiCorp Vault
# - Azure Key Vault
```

### Access Control

✅ **Limit who can deploy:**
- Vercel: Restrict to team members only
- GitHub: Protect `main` branch
- CI/CD: Use branch protection rules

### Regular Updates

```bash
# Update dependencies monthly
npm update

# Check for outdated packages
npm outdated

# Update Next.js
npm install next@latest
```

---

## Wallet Security

### User Education

Provide clear guidance to users:

✅ **DO:**
- Use hardware wallets for large amounts
- Verify transaction details before signing
- Check contract addresses match documentation
- Use trusted RPC endpoints
- Keep seed phrases offline and secure

❌ **DON'T:**
- Share private keys or seed phrases
- Sign transactions without reading them
- Use suspicious wallet browser extensions
- Connect to unknown websites
- Store large amounts in hot wallets

### Transaction Warnings

The app includes clear warnings before transactions:

```typescript
// Example: Create project
"Creating this project will cost gas fees.
Transaction cannot be reversed once confirmed."

// Example: Fund project
"You are about to send {amount} ETH to this project.
Funds cannot be refunded once goal is reached."
```

### Network Verification

✅ **Network Guard Component**
- Forces users to Base Sepolia network
- Shows clear warning if wrong network
- Prevents accidental mainnet transactions

```typescript
<NetworkGuard>
  {/* Content only shows on correct network */}
</NetworkGuard>
```

### Connection Security

✅ **RainbowKit Integration**
- Supports multiple wallets (MetaMask, Coinbase, WalletConnect)
- Secure connection protocols
- Auto-disconnect on network change
- Session management

---

## Monitoring and Incident Response

### Error Tracking

**Recommended Setup:**

```javascript
// Add Sentry for error tracking
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### What to Monitor

1. **Contract Events**
   - Genesis awards
   - Boost transactions
   - Project creations
   - Fund claims

2. **Frontend Errors**
   - Failed transactions
   - RPC errors
   - Wallet connection issues

3. **Performance Metrics**
   - Page load times
   - Contract read/write times
   - RPC response times

### Incident Response Plan

**If a security issue is discovered:**

1. **Assess Severity**
   - Critical: Funds at risk
   - High: User data exposed
   - Medium: Service disruption
   - Low: Minor bug

2. **Immediate Actions**
   ```bash
   # For critical issues:
   # 1. Pause the frontend (if possible)
   vercel --prod --pause
   
   # 2. Notify users (via banner or social media)
   # 3. Investigate the issue
   # 4. Prepare a fix
   ```

3. **Communication**
   - Notify affected users immediately
   - Post status updates regularly
   - Explain the issue clearly
   - Provide remediation steps

4. **Resolution**
   - Deploy fix
   - Verify fix in production
   - Monitor for 24 hours
   - Post-mortem documentation

### Contact Information

For security issues:
- **Email**: [Create a security email]
- **GitHub**: Open a security advisory
- **Discord**: [If you have a community]

---

## Security Checklist

Use this checklist to verify security before deployment:

### Smart Contracts
- [ ] Contracts compiled without warnings
- [ ] Test suite passes with 100% coverage for critical functions
- [ ] OpenZeppelin libraries up to date
- [ ] ReentrancyGuard on all fund transfers
- [ ] Access control properly implemented
- [ ] Contracts deployed on correct network
- [ ] Contract addresses verified on BaseScan

### Frontend
- [ ] No private keys in code
- [ ] `.env` in `.gitignore`
- [ ] Environment variables use `NEXT_PUBLIC_` prefix
- [ ] No `dangerouslySetInnerHTML` usage
- [ ] All user inputs escaped
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependencies audited (`npm audit`)

### Deployment
- [ ] Secrets stored in Vercel/secure vault
- [ ] Deploy keys restricted to team members
- [ ] `main` branch protected
- [ ] Automated security scans enabled
- [ ] Monitoring and alerting configured
- [ ] Rollback procedure documented
- [ ] Incident response plan ready

### User Safety
- [ ] Transaction warnings displayed
- [ ] Network guard active
- [ ] Amount confirmations shown
- [ ] Transaction links to block explorer
- [ ] Error messages helpful and clear
- [ ] Loading states prevent double-clicks

### Operational
- [ ] Error tracking setup (Sentry)
- [ ] Uptime monitoring active
- [ ] Logs accessible
- [ ] Backup procedure documented
- [ ] Security contact information public
- [ ] Dependency update schedule defined

---

## Security Updates

### Stay Informed

Follow security advisories:
- **GitHub**: Enable Dependabot alerts
- **npm**: `npm audit` regularly
- **OpenZeppelin**: https://blog.openzeppelin.com/security-audits
- **Base**: https://docs.base.org/security

### Update Schedule

**Weekly:**
- Check for high-severity security updates
- Review dependency advisories

**Monthly:**
- Update minor versions
- Run full security audit
- Review access logs

**Quarterly:**
- Major version updates (test thoroughly)
- Security training for team
- Review and update this document

---

## Vulnerability Disclosure

Found a security issue? We appreciate responsible disclosure:

1. **DO NOT** open a public GitHub issue
2. **DO** email [security email] with details
3. **DO** give us reasonable time to fix (90 days)
4. **DO** provide steps to reproduce

We commit to:
- Acknowledge receipt within 48 hours
- Provide regular updates on fix progress
- Credit you in our security advisories (if desired)
- Fix critical issues within 7 days

---

## Additional Resources

- [OWASP Web Security](https://owasp.org/www-project-top-ten/)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Ethereum Security Guide](https://ethereum.org/en/developers/docs/security/)

---

**Security is everyone's responsibility!** 🔒

Follow these guidelines to keep the platform and users safe.

---

*Last Updated: October 2025*
*Version: 1.0.0*
