# Eastern Mills Rug Tracker - Restructuring Plan

## Current Issues
- Complex department-based permissions creating confusion
- Multiple data fetching approaches causing inconsistencies
- Gallery showing 0 rugs due to data transformation issues
- Overly complex navigation with sampling/merchandising separation

## Proposed Simplified Structure

### 1. User Access Control (Authentication Required)
- **Admin Users**: Full system access, can manage all products, users, and buyers
- **Account Managers**: Assigned to specific buyers, see only their buyer's products
- **Viewers**: Read-only access to assigned buyer's products

### 2. Main Application Sections

#### A. Product Management
- **Single Product Creation Form**: All fields in one unified workflow
  - Basic Details (Design Name, Construction, Quality, Size, Color)
  - Materials & Costing (Materials, Weaving/Finishing costs, Overhead/Profit)
  - Process Flow (Manufacturing steps)
  - Photo Documentation (5 image slots)
- **Product Gallery**: Grid view of all products (filtered by user's buyer assignment)

#### B. Costing Review
- **Price Calculation**: Review and calculate prices for client quotes
- **Multi-Selection**: Select multiple products for combined quotes
- **Currency/Unit Options**: PSM/PSF, INR/USD conversion
- **Export Capabilities**: Generate quote documents

#### C. Quote History
- **Client Quote Tracking**: Track all quotes sent to clients
- **Timeline View**: See quote history with dates and responses
- **Status Management**: Active, Pending, Accepted, Rejected quotes

#### D. PDOC Management
- **Production Documentation**: Create production orders from products
- **File Management**: Upload test reports, specifications
- **Version Control**: Track PDOC versions and updates

#### E. Buyer Management
- **Buyer Database**: Manage buyer information and codes
- **Account Assignment**: Assign account managers to specific buyers
- **Contact Management**: Email, phone, address information

### 3. Database Schema Updates

#### Users Table Enhancement
```sql
ALTER TABLE users ADD COLUMN assigned_buyers TEXT[]; -- Array of buyer IDs
ALTER TABLE users ADD COLUMN access_level VARCHAR(50); -- 'admin', 'account_manager', 'viewer'
```

#### Products Table (Unified)
- Combine all rug data into single products table
- Remove complex department-specific fields
- Add buyer_id for filtering

#### User-Buyer Assignments
- Track which users can access which buyers' products
- Admin users see all, account managers see assigned buyers only

### 4. Implementation Steps

1. **Database Migration**: Consolidate rug data, update user permissions
2. **Authentication Enhancement**: Ensure only logged-in users can access
3. **Navigation Simplification**: Single sidebar with 5 main sections
4. **Data Filtering**: Implement buyer-based filtering throughout
5. **Permission Enforcement**: Role-based access at component level

### 5. Benefits of New Structure

- **Simplified Navigation**: 5 clear sections instead of complex department tabs
- **Better Security**: Proper user-based access control
- **Account Management**: Clear buyer assignments for account managers
- **Data Consistency**: Single data source and transformation approach
- **Faster Development**: Less complex permission logic
- **Better User Experience**: Clear workflow from product creation to quote generation

### 6. Migration Strategy

1. Keep existing data intact during transition
2. Create new simplified components alongside existing ones
3. Migrate users to new permission structure gradually
4. Test thoroughly with real user scenarios
5. Switch to new system once validated

This restructure will create a much cleaner, more maintainable system focused on the actual business workflow rather than artificial department boundaries.