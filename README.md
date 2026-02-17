# 🏥 ART Web / PreART System
## Complete User & Developer Documentation

---

## 📋 **Table of Contents**

1. [System Overview](#system-overview)
2. [Key Features](#key-features)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Getting Started](#getting-started)
5. [User Interface Guide](#user-interface-guide)
6. [API Documentation](#api-documentation)
7. [Database Structure](#database-structure)
8. [Development Guide](#development-guide)
9. [Troubleshooting](#troubleshooting)
10. [Support & Maintenance](#support--maintenance)

---

## 🏥 **System Overview**

The ART Web / PreART Medical Management System is a comprehensive web-based platform for managing HIV/AIDS treatment across multiple health facilities. It provides real-time reporting, patient management, and analytics capabilities for healthcare professionals.

### **Architecture**
- **Frontend**: React 18 with Vite, Tailwind CSS, Radix UI
- **Backend**: Node.js with Express.js, MySQL, Sequelize ORM
- **Authentication**: JWT-based with role-based access control
- **Database**: Multi-site architecture with individual databases per facility (preart_ prefix)

### **Health Facilities Supported**
- **0201**: Maung Russey RH
- **0202**: Battambang PH  
- **0301**: Kampong Cham PH
- **0306**: Chamkar Leu RH
- **1209**: Chhuk Sor
- **1801**: Preah Sihanouk PH
- **2101**: Takeo PH
- **2104**: Preykbas

---

## ✨ **Key Features**

### **👥 Patient Management**
- **Multi-Age Group Support**: Adults, children, and infants
- **Complete Medical Records**: Comprehensive patient data management
- **Visit Tracking**: Detailed visit history and follow-up management
- **Status Monitoring**: Patient status changes and outcomes tracking
- **Search & Filter**: Advanced patient search and filtering capabilities

### **📊 Reporting & Analytics**
- **Real-Time Indicators**: Live ART performance indicators
- **Site-Specific Reports**: Individual facility and aggregated reporting
- **Export Capabilities**: CSV export for external analysis
- **Performance Monitoring**: System health and query performance metrics
- **Executive Summary**: Key performance indicators at a glance

### **🔐 User Management**
- **Role-Based Access**: 7 different user roles with specific permissions
- **Secure Authentication**: JWT-based authentication system
- **User Administration**: Complete user management interface
- **Site Assignment**: Users can be assigned to specific health facilities

### **🏢 Multi-Site Architecture**
- **Site Registry**: Central management of health facilities
- **Site-Specific Data**: Independent databases per facility
- **File Name Integration**: Unique file identifiers for data tracking
- **Scalable Design**: Support for unlimited health facilities

### **📁 Data Import/Export**
- **SQL File Import**: Upload SQL files to create new sites and databases
- **Automatic Site Detection**: Extract site information from `tblsitename` tables
- **Data Validation**: Comprehensive validation before import
- **Progress Tracking**: Real-time import progress monitoring

---

## 👥 **User Roles & Permissions**

### **🔑 Super Administrator**
- **Full System Access**: Complete control over all features
- **User Management**: Create, edit, delete users and roles
- **Site Management**: Manage all health facilities
- **Data Import**: Import SQL files and create new sites
- **System Administration**: Access to all administrative functions

### **👨‍💼 Administrator**
- **Site Management**: Manage assigned health facilities
- **User Management**: Create and manage users for assigned sites
- **Patient Management**: Full patient data access
- **Reporting**: Access to all reports and analytics
- **Data Entry**: Complete data entry capabilities

### **👨‍⚕️ Doctor**
- **Patient Care**: Full patient management and medical records
- **Medical Data**: Enter and update medical information
- **Reports**: Access to medical reports and analytics
- **Data Entry**: Medical data entry and updates

### **👩‍⚕️ Nurse**
- **Patient Care**: Basic patient management
- **Data Entry**: Basic data entry capabilities
- **Reports**: Access to basic reports

### **📝 Data Entry**
- **Data Entry Only**: Limited to data entry functions
- **No Medical Decisions**: Cannot make medical decisions
- **Basic Reports**: Access to basic reporting

### **👁️ Viewer**
- **Read-Only Access**: View reports and data only
- **No Data Entry**: Cannot modify any data
- **Indicators Only**: Access to indicators and reports

### **🏢 Site Manager**
- **Site Operations**: Manage specific site operations
- **Data Entry**: Site-specific data entry
- **Reports**: Site-specific reporting

---

## 🚀 **Getting Started**

### **Prerequisites**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Valid user account provided by administrator

### **Login Process**
1. Navigate to the application URL
2. Enter your username and password
3. Click "Login" to access the system
4. You'll be redirected to your role-appropriate dashboard

### **First Time Setup**
1. **Change Password**: Update your default password
2. **Profile Setup**: Complete your user profile
3. **Site Assignment**: Ensure you're assigned to the correct health facilities
4. **Training**: Review the user interface guide below

---

## 🖥️ **User Interface Guide**

### **Main Navigation**

#### **Dashboard** (Admin/Super Admin only)
- **Patient Statistics**: Total adults, children, and infants
- **Quick Actions**: Direct links to create new patients
- **System Information**: Current system status

#### **Patient Management** (Admin/Super Admin only)
- **Patient List**: View and search all patients
- **New Patient Forms**:
  - Adult Patient Form
  - Child Patient Form  
  - Infant Patient Form
- **Patient Search**: Advanced search and filtering
- **Patient Details**: Complete patient information

#### **Visit Management** (Admin/Super Admin only)
- **Visit Lists**: View visits by patient type
- **New Visit Forms**:
  - Adult Visit Form
  - Child Visit Form
  - Infant Visit Form
- **Visit History**: Complete visit tracking

#### **Indicators & Reports** (All Users)
- **Main Indicators**: Real-time ART performance indicators
- **Site Selection**: Choose specific health facilities
- **Date Range**: Select reporting periods
- **Export Options**: Download reports in CSV format
- **Executive Summary**: Key performance metrics

#### **Data Management** (Admin/Super Admin only)
- **Data Import/Export**: Manage data transfers
- **Site Management**: Configure health facilities
- **System Settings**: Application configuration

#### **User Management** (Admin/Super Admin only)
- **User List**: View all system users
- **Role Management**: Assign and modify user roles
- **User Creation**: Add new users to the system
- **Permission Management**: Configure user access levels

#### **Import Data** (Admin/Super Admin only)
- **SQL File Upload**: Upload SQL files to create new sites
- **Site Creation**: Create new health facilities
- **Data Validation**: Validate imported data
- **Progress Tracking**: Monitor import progress

### **Key Interface Elements**

#### **Site Filter**
- Located in the top navigation
- Select specific health facilities
- "All Sites" option for aggregated data
- Real-time filtering of all data

#### **Search & Filter**
- Advanced search capabilities
- Multiple filter options
- Real-time results
- Save filter preferences

#### **Status Indicators**
- **Active**: Green - Patient is active
- **Inactive**: Gray - Patient is inactive
- **Transferred**: Orange - Patient transferred out
- **Lost**: Red - Patient lost to follow-up
- **Dead**: Dark Gray - Patient deceased

#### **Data Tables**
- Sortable columns
- Pagination controls
- Export options
- Responsive design

---

## 🔌 **API Documentation**

### **Authentication Endpoints**

#### **POST /apiv1/auth/login**
Login to the system
```json
{
  "username": "string",
  "password": "string"
}
```

#### **GET /apiv1/auth/profile**
Get current user profile
```json
{
  "id": "number",
  "username": "string",
  "fullName": "string",
  "role": "string",
  "assignedSites": "array"
}
```

#### **POST /apiv1/auth/logout**
Logout from the system

### **Site Management Endpoints**

#### **GET /apiv1/site-operations/sites**
Get all available sites
```json
{
  "success": true,
  "sites": [
    {
      "code": "0201",
      "name": "Maung Russey RH",
      "province": "Battambang",
      "database_name": "preart_0201",
      "status": 1
    }
  ]
}
```

#### **GET /apiv1/site-operations/sites/:code/stats**
Get site statistics
```json
{
  "success": true,
  "stats": {
    "totalPatients": 150,
    "activePatients": 120,
    "newThisMonth": 5
  }
}
```

### **Indicators Endpoints**

#### **GET /apiv1/indicators-optimized/all**
Get all indicators for selected site and date range
```json
{
  "success": true,
  "indicators": [
    {
      "id": "01_active_art_previous",
      "name": "Active ART Previous Period",
      "value": 150,
      "category": "enrollment"
    }
  ]
}
```

#### **GET /apiv1/indicators-optimized/category/:category**
Get indicators by category
- Categories: `enrollment`, `retention`, `treatment`, `outcomes`

#### **GET /apiv1/indicators-optimized/:indicator/details**
Get detailed breakdown of specific indicator

### **Patient Management Endpoints**

#### **GET /apiv1/patients/adult**
Get adult patients
```json
{
  "success": true,
  "patients": [
    {
      "clinicId": "0201-001",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1980-01-01",
      "sex": "M"
    }
  ],
  "total": 50
}
```

#### **POST /apiv1/patients/adult**
Create new adult patient

#### **PUT /apiv1/patients/adult/:id**
Update adult patient

#### **DELETE /apiv1/patients/adult/:id**
Delete adult patient

### **Import Data Endpoints**

#### **POST /apiv1/import/sql**
Import SQL file and create new site
```json
{
  "createNewDatabase": "true",
  "siteCode": "0205",
  "siteName": "New Health Center",
  "province": "Phnom Penh",
  "district": "Chamkar Mon",
  "fileName": "site_data_2024.sql"
}
```

### **Report Endpoints**

#### **GET /apiv1/reports/infant-report**
Get aggregated Infant report for a site and period
```json
{
  "success": true,
  "siteCode": "0201",
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-03-31",
    "previousEndDate": "2024-12-31"
  },
  "sections": [
    {
      "id": "11_INFANT_DNA_9MONTHS_aggregate",
      "title": "DNA PCR at 9 months",
      "rows": [
        { "label": "Total", "total": 120, "male": 60, "female": 60 }
      ]
    }
  ]
}
```
Query parameters:
- `siteCode` (required)
- `startDate`, `endDate`, `previousEndDate` (optional, ISO date strings)

#### **GET /apiv1/reports/infant-report/details**
Get Infant report detail rows for a given aggregate section
Query parameters:
- `siteCode` (required)
- `scriptId` (required, e.g. `11_INFANT_DNA_9MONTHS_details`)
- `startDate`, `endDate`, `previousEndDate` (optional)

#### **GET /apiv1/reports/pntt-report**
Get aggregated PNTT report for a site and period (Partners & Children)
Query parameters:
- `siteCode` (required)
- `startDate`, `endDate`, `previousEndDate` (optional)

#### **GET /apiv1/reports/pntt-report/details**
Get PNTT report detail rows for a given aggregate section
Query parameters:
- `siteCode` (required)
- `scriptId` (required, matches a file in `PNTT_DETAIL_SCRIPTS`)
- `startDate`, `endDate`, `previousEndDate` (optional)

#### **GET /apiv1/reports/idpoor-duplicated-artid**
List IDPoor patients among active patients who share duplicated ART IDs
Query parameters:
- `startDate`, `endDate` (optional; defaults to current year)
- `siteId` (optional; site code or `all`)
- `page`, `pageSize` (optional pagination)
- `search` (optional free-text filter)

---

## 🗄️ **Database Structure**

### **Registry Database (preart_sites_registry)**
Central database for system management

#### **Users Table (tbluser)**
```sql
- Uid (Primary Key)
- User (Username)
- Pass (Password Hash)
- Fullname (Full Name)
- Status (Active/Inactive)
- Role (User Role)
- AssignedSites (JSON Array)
```

#### **Sites Table (sites)**
```sql
- id (Primary Key)
- code (Site Code)
- name (Site Name)
- short_name (Short Name)
- display_name (Display Name)
- search_terms (Search Terms)
- file_name (File Name)
- province (Province)
- type (Site Type)
- database_name (Database Name)
- status (Active/Inactive)
```

### **Site-Specific Databases (preart_XXXX)**
Individual databases for each health facility

#### **Main Patient Table (tblcimain)**
```sql
- Id (Primary Key)
- ClinicId (Unique Patient ID)
- ArtNumber (ART Number)
- FirstName (First Name)
- LastName (Last Name)
- DateOfBirth (Date of Birth)
- Sex (Gender)
- Address (Address)
- Phone (Phone Number)
- Province (Province)
- FirstVisitDate (First Visit Date)
- PatientType (Adult/Child/Infant)
- MaritalStatus (Marital Status)
- Occupation (Occupation)
- Group (Target Group)
- HouseNumber (House Number)
- Street (Street)
- District (District)
- Commune (Commune)
- Village (Village)
- Nationality (Nationality)
- TargetGroup (Target Group)
```

#### **Child Patient Table (tblcimain)**
Extended information for child patients

#### **Infant Patient Table (tbleimain)**
Extended information for infant patients

#### **Visit Tables**
- **Adult Visits**: `tblcivisit`
- **Child Visits**: `tblcivisit`
- **Infant Visits**: `tbleivisit`

#### **Test Tables**
- **Patient Tests**: `tblcitest`

#### **Status Tables**
- **Patient Status**: `tblcistatus`

---

## 🛠️ **Development Guide**

### **Prerequisites**
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn
- Git

### **Installation**

#### **1. Clone Repository**
```bash
git clone <repository-url>
cd artweb
```

#### **2. Backend Setup**
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
npm start
```

#### **3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
`

#### **5. Database Setup Complete**
All databases use the preart_ naming convention by default.

**⚠️ Important**: If you get the error `Table 'preart_sites_registry.tblartsite' doesn't exist`, run the table creation command above.

### **Project Structure**

```
artweb/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   └── sql-workbench/   # SQL queries
│   ├── scripts/             # Database scripts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── package.json
└── README.md
```

### **SQL Workbench & Analysis Scripts**

- **Location**: `backend/src/sql-workbench/`
- **Contents**: Aggregate and detail SQL scripts for ART, Infant, PNTT, and related indicators
- **Download as ZIP**:
  - **From UI**: Open `Analytics Admin` → `Analytics Data` → click **Download SQL Workbench**
  - **Via API** (authenticated): `GET /apiv1/scripts/scripts/download-sql-workbench`

### **Development Commands**

#### **Backend**
```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
npm run lint       # Run linter
```

#### **Frontend**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run linter
```

### **Environment Variables**

#### **Backend (.env)**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=preart_sites_registry
DB_USER=root
DB_PASSWORD=your_password
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=524288000
UPLOAD_PATH=./uploads
```

#### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=PreART Medical Management System
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Login Problems**
- **Invalid Credentials**: Check username and password
- **Account Disabled**: Contact administrator
- **Network Error**: Check internet connection

#### **Data Loading Issues**
- **Site Not Found**: Verify site code exists
- **Permission Denied**: Check user role and site assignment
- **Database Connection**: Verify database connectivity

#### **Import Data Issues**
- **File Too Large**: Ensure file is under 500MB
- **Invalid SQL**: Check SQL file format
- **Site Already Exists**: Use existing site or different code

#### **Performance Issues**
- **Slow Loading**: Check network connection
- **Memory Issues**: Close other applications
- **Database Timeout**: Contact system administrator

### **Error Messages**

#### **Authentication Errors**
- `Invalid username or password`: Check credentials
- `Account disabled`: Contact administrator
- `Token expired`: Logout and login again

#### **Permission Errors**
- `Access denied`: Insufficient permissions
- `Site not assigned`: Contact administrator
- `Role required`: Upgrade user role

#### **Data Errors**
- `Site not found`: Verify site code
- `Patient not found`: Check patient ID
- `Validation failed`: Check required fields

#### **Database Errors**
- `Table 'preart_sites_registry.tblartsite' doesn't exist`: Run the table creation command in the installation section
- `Unknown database 'preart_sites_registry'`: Create the database first
- `Access denied for user`: Check database credentials in .env file

---

## 🆘 **Support & Maintenance**

### **System Requirements**

#### **Minimum Requirements**
- **RAM**: 4GB
- **Storage**: 10GB free space
- **CPU**: 2 cores
- **Network**: Stable internet connection

#### **Recommended Requirements**
- **RAM**: 8GB or more
- **Storage**: 50GB free space
- **CPU**: 4 cores or more
- **Network**: High-speed internet connection

### **Backup Procedures**

#### **Database Backup**
```bash
# Backup registry database
mysqldump -u root -p preart_sites_registry > registry_backup.sql

# Backup site databases
mysqldump -u root -p preart_0201 > site_0201_backup.sql
```

#### **File Backup**
- Regular backup of uploaded files
- Configuration file backups
- Log file archives

### **Maintenance Tasks**

#### **Daily**
- Monitor system performance
- Check error logs
- Verify data integrity

#### **Weekly**
- Database optimization
- Log file cleanup
- Security updates

#### **Monthly**
- Full system backup
- Performance analysis
- User access review

### **Contact Information**

#### **Technical Support**
- **Email**: daracheol@gmil.com
- **Phone**: +855-15-268-853
- **Hours**: Monday-Friday, 8AM-5PM

---

## 📝 **Changelog**

### **Version 2.0.0** (Current)
- Complete UI redesign with modern interface
- Enhanced role-based access control
- Improved data import/export functionality
- Advanced reporting and analytics
- Mobile-responsive design
- Performance optimizations

### **Version 1.0.0**
- Initial release
- Basic patient management
- Simple reporting
- Multi-site support

---

## 📄 **License**

This software is proprietary and confidential. All rights reserved.

---

**Last Updated**: Oct 2025  
**Version**: 2.0.0  
**Documentation Version**: 1.0.0
