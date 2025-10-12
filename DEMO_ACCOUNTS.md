# 🔑 Demo Account Credentials

## Admin Account
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@agrilink.com` | `admin123` |

**Admin Features:**
- Full system access and management
- Admin dashboard at `/admin`
- User management and verification
- Product management
- System statistics

---

## Individual Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| **Farmer** | `farmerindi1@gmail.com` | `123456` |
| **Farmer** | `farmerindi2@gmail.com` | `123456` |
| **Trader** | `traderindi1@gmail.com` | `123456` |
| **Trader** | `traderindi2@gmail.com` | `123456` |
| **Buyer** | `buyerindi1@gmail.com` | `123456` |
| **Buyer** | `buyerindi2@gmail.com` | `123456` |

---

## Business Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| **Farmer** | `farmerbiz1@gmail.com` | `123456` |
| **Farmer** | `farmerbiz2@gmail.com` | `123456` |
| **Trader** | `traderbiz1@gmail.com` | `123456` |
| **Trader** | `traderbiz2@gmail.com` | `123456` |
| **Buyer** | `buyerbiz1@gmail.com` | `123456` |
| **Buyer** | `buyerbiz2@gmail.com` | `123456` |

---

## Additional Demo Accounts (from seed data)
| Role | Email | User Type | Account Type |
|------|-------|-----------|--------------|
| **Trader** | `traderbiz2@gmail.com` | trader | business |
| **Farmer** | `farmerbiz2@gmail.com` | farmer | business |
| **Buyer** | `buyer1@gmail.com` | buyer | individual |

---

## Legacy Demo Accounts (local storage mode)
| Role | Email | Password |
|------|-------|----------|
| **Farmer** | `farmer@demo.com` | `demo123` |
| **Trader** | `trader@demo.com` | `demo123` |
| **Buyer** | `buyer@demo.com` | `demo123` |

---

## Alternative Demo Accounts (from DemoAccountsLogin component)
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@agrilink.com` | `admin123` |
| **Farmer** | `thura.farmer@gmail.com` | `farmer123` |
| **Trader** | `kyaw.trader@gmail.com` | `trader123` |
| **Buyer** | `su.buyer@gmail.com` | `buyer123` |

---

## 🎯 Quick Test Recommendations

### For Testing Different User Types:
- **Admin**: `admin@agrilink.com` / `admin123`
- **Farmer**: `farmerindi1@gmail.com` / `123456`
- **Trader**: `traderbiz1@gmail.com` / `123456`
- **Buyer**: `buyerindi1@gmail.com` / `123456`

### Account Type Differences:
- **Individual accounts** (`indi`): Personal farmers/traders/buyers
- **Business accounts** (`biz`): Company accounts with business features
- **All accounts are pre-verified** and ready to use
- **All numbered accounts use password**: `123456`

---

## 📱 How to Use:
1. Go to login page: `http://localhost:3001/login`
2. Use any of the credentials above
3. Admin users are redirected to `/admin`
4. Regular users are redirected to `/dashboard`

---

## 🔧 Notes:
- Demo accounts skip email verification automatically
- All accounts are pre-verified in the database
- Admin account has full system access
- Business accounts have additional business features
- Individual accounts are for personal use scenarios
