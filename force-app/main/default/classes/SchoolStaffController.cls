public without sharing class SchoolStaffController {

    /* ─────────────────────────────────────────
       WRAPPER CLASSES
    ───────────────────────────────────────── */

    public class StaffWrapper {
        @AuraEnabled public String  id;
        @AuraEnabled public String  employeeId;
        @AuraEnabled public String  firstName;
        @AuraEnabled public String  lastName;
        @AuraEnabled public String  name;
        @AuraEnabled public String  gender;
        @AuraEnabled public String  dob;
        @AuraEnabled public String  email;
        @AuraEnabled public String  phone;
        @AuraEnabled public String  address;
        @AuraEnabled public String  designation;
        @AuraEnabled public String  department;
        @AuraEnabled public String  staffType;
        @AuraEnabled public String  subject;
        @AuraEnabled public String  qualification;
        @AuraEnabled public String  joiningDate;
        @AuraEnabled public String  status;
        @AuraEnabled public Decimal basicSalary;
        @AuraEnabled public Decimal hra;
        @AuraEnabled public Decimal da;
        @AuraEnabled public Decimal pf;
        @AuraEnabled public String  accountNumber;
        @AuraEnabled public String  ifsc;
        @AuraEnabled public String  salaryStatus;
    }

    public class PayrollWrapper {
        @AuraEnabled public String  id;
        @AuraEnabled public String  staffId;
        @AuraEnabled public String  staffName;
        @AuraEnabled public String  designation;
        @AuraEnabled public String  staffType;
        @AuraEnabled public String  employeeId;
        @AuraEnabled public Decimal basicSalary;
        @AuraEnabled public Decimal allowances;
        @AuraEnabled public Decimal deductions;
        @AuraEnabled public Decimal netSalary;
        @AuraEnabled public String  salaryStatus;
        @AuraEnabled public String  invoiceMonth;
    }

    /* ─────────────────────────────────────────
       READ – GET ALL STAFF
    ───────────────────────────────────────── */

    @AuraEnabled(cacheable=true)
    public static List<StaffWrapper> getAllStaff() {
        List<Account> accounts = [
            SELECT Id, FirstName, LastName, Name,
                   PersonEmail, PersonMobilePhone,
                   PersonBirthdate, PersonMailingStreet,
                   Type,
                   Employee_ID__c,
                   PersonGenderIdentity,
                   Designation__c,
                   PersonDepartment,
                   Joining_Date__c,
                   Subject_Taught__c,
                   Qualification__c,
                   Basic_Salary__c,
                   HRA__c,
                   DA__c,
                   PF_Deduction__c,
                   Bank_Account_Number__c,
                   IFSC_Code__c,
                   Staff_Status__c
            FROM Account
            WHERE IsPersonAccount = true
              AND Type IN ('Teacher', 'Non Teaching Staff')
            ORDER BY CreatedDate DESC
        ];

        Set<Id> accountIds = new Map<Id, Account>(accounts).keySet();
        Map<Id, String> salaryStatusMap = getSalaryStatusMap(accountIds);

        List<StaffWrapper> result = new List<StaffWrapper>();
        for (Account acc : accounts) {
            result.add(toWrapper(acc, salaryStatusMap.get(acc.Id)));
        }
        return result;
    }

    /* ─────────────────────────────────────────
       READ – GET PAYROLL RECORDS
    ───────────────────────────────────────── */

    @AuraEnabled(cacheable=true)
    public static List<PayrollWrapper> getPayrollRecords(String invoiceMonth) {
        List<Account> accounts = [
            SELECT Id, Name, FirstName, LastName,
                   Type, Employee_ID__c, Designation__c,
                   Basic_Salary__c, HRA__c, DA__c, PF_Deduction__c
            FROM Account
            WHERE IsPersonAccount = true
              AND Type IN ('Teacher', 'Non Teaching Staff')
            ORDER BY Name ASC
        ];

        Map<Id, Invoice__c> invoiceByAccount = new Map<Id, Invoice__c>();
        for (Invoice__c inv : [
            SELECT Id, Account__c, Status__c, Invoice_Month__c
            FROM Invoice__c
            WHERE Invoice_Type__c  = 'Salary'
              AND Invoice_Month__c = :invoiceMonth
              AND Account__c IN    :new Map<Id, Account>(accounts).keySet()
        ]) {
            invoiceByAccount.put(inv.Account__c, inv);
        }

        List<PayrollWrapper> result = new List<PayrollWrapper>();
        for (Account acc : accounts) {
            Invoice__c inv = invoiceByAccount.get(acc.Id);
            Decimal basic = acc.Basic_Salary__c != null ? acc.Basic_Salary__c : 0;
            Decimal hra   = acc.HRA__c          != null ? acc.HRA__c          : 0;
            Decimal da    = acc.DA__c           != null ? acc.DA__c           : 0;
            Decimal pf    = acc.PF_Deduction__c != null ? acc.PF_Deduction__c : 0;

            PayrollWrapper pw = new PayrollWrapper();
            pw.staffId      = acc.Id;
            pw.staffName    = acc.Name;
            pw.designation  = acc.Designation__c;
            pw.staffType    = acc.Type == 'Teacher' ? 'Teaching' : 'Non-Teaching';
            pw.employeeId   = acc.Employee_ID__c;
            pw.basicSalary  = basic;
            pw.allowances   = hra + da;
            pw.deductions   = pf;
            pw.netSalary    = basic + hra + da - pf;
            pw.invoiceMonth = invoiceMonth;

            if (inv != null) {
                pw.id           = inv.Id;
                pw.salaryStatus = inv.Status__c == 'Paid' ? 'Paid' : 'Pending';
            } else {
                pw.id           = null;
                pw.salaryStatus = 'Pending';
            }
            result.add(pw);
        }
        return result;
    }

    /* ─────────────────────────────────────────
       WRITE – UPSERT STAFF MEMBER

       ROOT CAUSE FIXES:
       1. Validation now done AFTER null-safe trimming, not before.
       2. RecordTypeId lookup made safe — if no PersonAccount RT exists
          we skip setting it (some orgs use a default RT).
       3. PersonGenderIdentity is a standard picklist — blank string
          causes a DML error on some orgs; set to null instead of ''.
       4. All String fields use safeStr() to avoid passing empty strings
          where Salesforce expects null.
       5. Detailed exception logging so the REAL error surfaces instead
          of being swallowed by the outer catch re-throwing
          'First Name is required.'
    ───────────────────────────────────────── */

    @AuraEnabled
    public static String upsertStaff(StaffWrapper data) {

        // ── Step 1: Null-safe trim helpers applied first ──────────────
        String firstName  = safeStr(data.firstName);
        String lastName   = safeStr(data.lastName);
        String email      = safeStr(data.email);
        String phone      = safeStr(data.phone);

        System.debug('upsertStaff called — firstName=' + firstName
            + ' | lastName=' + lastName
            + ' | email=' + email
            + ' | phone=' + phone
            + ' | basicSalary=' + data.basicSalary
            + ' | staffType=' + data.staffType
            + ' | id=' + data.id);

        // ── Step 2: Validate AFTER trimming ───────────────────────────
        if (String.isBlank(firstName)) {
            throw new AuraHandledException('First Name is required.');
        }
        if (String.isBlank(lastName)) {
            throw new AuraHandledException('Last Name is required.');
        }
        if (String.isBlank(email)) {
            throw new AuraHandledException('Email is required.');
        }
        if (String.isBlank(phone)) {
            throw new AuraHandledException('Phone is required.');
        }
        if (data.basicSalary == null || data.basicSalary <= 0) {
            throw new AuraHandledException('Please enter a valid Basic Salary.');
        }

        try {
            Account acc;

            if (String.isNotBlank(data.id)) {
                // UPDATE — load existing record
                acc = new Account(Id = data.id);
                System.debug('upsertStaff — UPDATE mode for id: ' + data.id);
            } else {
                // INSERT — new record, must set RecordTypeId for Person Account
                acc = new Account();
                Id rtId = getPersonAccountRecordTypeId();
                System.debug('upsertStaff — INSERT mode, PersonAccount RecordTypeId: ' + rtId);
                if (rtId != null) {
                    acc.RecordTypeId = rtId;
                }
                // If rtId is null the org uses a default RT — Salesforce
                // will assign it automatically; do NOT throw here.
            }

            // ── Standard Person Account fields ────────────────────────
            acc.FirstName           = firstName;
            acc.LastName            = lastName;
            acc.PersonEmail         = email;
            acc.PersonMobilePhone   = String.isNotBlank(safeStr(data.phone))
                                        ? safeStr(data.phone) : null;
            acc.PersonMailingStreet = String.isNotBlank(safeStr(data.address))
                                        ? safeStr(data.address) : null;

            // Type: 'Teacher' or 'Non Teaching Staff'
            acc.Type = (safeStr(data.staffType) == 'Teaching')
                        ? 'Teacher' : 'Non Teaching Staff';

            // ── PersonGenderIdentity — must be null (not '') if blank ─
            // Passing an empty string to a picklist field causes DML error
            String gender = safeStr(data.gender);
            acc.PersonGenderIdentity = String.isNotBlank(gender) ? gender : null;

            // ── Department ────────────────────────────────────────────
            String dept = safeStr(data.department);
            acc.PersonDepartment = String.isNotBlank(dept) ? dept : null;

            // ── Custom fields ─────────────────────────────────────────
            String desig = safeStr(data.designation);
            acc.Designation__c = String.isNotBlank(desig) ? desig : null;

            String subj = safeStr(data.subject);
            acc.Subject_Taught__c = String.isNotBlank(subj) ? subj : null;

            String qual = safeStr(data.qualification);
            acc.Qualification__c = String.isNotBlank(qual) ? qual : null;

            acc.Basic_Salary__c        = data.basicSalary != null ? data.basicSalary : 0;
            acc.HRA__c                 = data.hra         != null ? data.hra         : 0;
            acc.DA__c                  = data.da          != null ? data.da          : 0;
            acc.PF_Deduction__c        = data.pf          != null ? data.pf          : 0;

            String accNum = safeStr(data.accountNumber);
            acc.Bank_Account_Number__c = String.isNotBlank(accNum) ? accNum : null;

            String ifscVal = safeStr(data.ifsc);
            acc.IFSC_Code__c = String.isNotBlank(ifscVal) ? ifscVal : null;

            String statusVal = safeStr(data.status);
            acc.Staff_Status__c = String.isNotBlank(statusVal) ? statusVal : 'Active';

            // ── Safe date parsing ─────────────────────────────────────
            if (String.isNotBlank(safeStr(data.dob))) {
                try {
                    acc.PersonBirthdate = Date.valueOf(data.dob);
                } catch (Exception ex) {
                    System.debug('upsertStaff — invalid DOB skipped: ' + data.dob);
                }
            }
            if (String.isNotBlank(safeStr(data.joiningDate))) {
                try {
                    acc.Joining_Date__c = Date.valueOf(data.joiningDate);
                } catch (Exception ex) {
                    System.debug('upsertStaff — invalid joiningDate skipped: ' + data.joiningDate);
                }
            }

            // ── DML ───────────────────────────────────────────────────
            if (String.isNotBlank(data.id)) {
                System.debug('upsertStaff — running UPDATE');
                update acc;
                System.debug('upsertStaff — UPDATE success, id: ' + acc.Id);
                return acc.Id;
            } else {
                System.debug('upsertStaff — running INSERT, acc: ' + JSON.serialize(acc));
                insert acc;
                System.debug('upsertStaff — INSERT success, id: ' + acc.Id);

                // Auto-generate Employee ID after insert
                String empId = generateEmployeeId(acc.Id, safeStr(data.staffType));
                acc.Employee_ID__c = empId;
                update acc;
                System.debug('upsertStaff — Employee ID set: ' + empId);
                return acc.Id;
            }

        } catch (AuraHandledException ahe) {
            // Re-throw our own validation messages as-is
            System.debug('upsertStaff — AuraHandledException: ' + ahe.getMessage());
            throw ahe;
        } catch (DmlException dml) {
            // Surface the actual Salesforce DML error (field name + message)
            String dmlMsg = '';
            for (Integer i = 0; i < dml.getNumDml(); i++) {
                dmlMsg += dml.getDmlFieldNames(i) + ': ' + dml.getDmlMessage(i) + '; ';
            }
            System.debug('upsertStaff — DmlException: ' + dmlMsg);
            throw new AuraHandledException('Save failed: ' + dmlMsg);
        } catch (Exception e) {
            System.debug('upsertStaff — Exception: ' + e.getMessage() + ' | ' + e.getStackTraceString());
            throw new AuraHandledException('Save failed: ' + e.getMessage());
        }
    }

    /* ─────────────────────────────────────────
       WRITE – DELETE STAFF MEMBER
    ───────────────────────────────────────── */

    @AuraEnabled
    public static void deleteStaff(String staffId) {
        try {
            if (String.isBlank(staffId)) {
                throw new AuraHandledException('Staff ID is required for deletion.');
            }
            delete [SELECT Id FROM Account WHERE Id = :staffId LIMIT 1];
        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting staff: ' + e.getMessage());
        }
    }

    /* ─────────────────────────────────────────
       WRITE – PAY SINGLE SALARY (Invoice)
    ───────────────────────────────────────── */

    @AuraEnabled
    public static String paySalary(String staffId, String invoiceMonth) {
        try {
            if (String.isBlank(staffId))      throw new AuraHandledException('Staff ID is required.');
            if (String.isBlank(invoiceMonth)) throw new AuraHandledException('Invoice month is required.');

            Account acc = [
                SELECT Id, Name, Basic_Salary__c, HRA__c, DA__c, PF_Deduction__c
                FROM Account WHERE Id = :staffId LIMIT 1
            ];

            Decimal basic = acc.Basic_Salary__c != null ? acc.Basic_Salary__c : 0;
            Decimal hra   = acc.HRA__c          != null ? acc.HRA__c          : 0;
            Decimal da    = acc.DA__c           != null ? acc.DA__c           : 0;
            Decimal pf    = acc.PF_Deduction__c != null ? acc.PF_Deduction__c : 0;
            Decimal net   = basic + hra + da - pf;

            List<Invoice__c> existing = [
                SELECT Id, Status__c FROM Invoice__c
                WHERE Account__c       = :staffId
                  AND Invoice_Type__c  = 'Salary'
                  AND Invoice_Month__c = :invoiceMonth
                LIMIT 1
            ];

            if (!existing.isEmpty()) {
                existing[0].Status__c = 'Paid';
                update existing[0];
                return existing[0].Id;
            } else {
                Invoice__c inv = new Invoice__c();
                inv.Account__c       = staffId;
                inv.Invoice_Date__c  = Date.today();
                inv.Due_Date__c      = Date.today();
                inv.Status__c        = 'Paid';
                inv.Total_Amount__c  = net;
                inv.Invoice_Type__c  = 'Salary';
                inv.Invoice_Month__c = invoiceMonth;
                inv.Description__c   = 'Monthly salary for ' + invoiceMonth
                                     + ' | Basic: ' + basic
                                     + ' | HRA: '   + hra
                                     + ' | DA: '    + da
                                     + ' | PF: -'   + pf;
                insert inv;
                return inv.Id;
            }
        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            throw new AuraHandledException('Error processing payment: ' + e.getMessage());
        }
    }

    /* ─────────────────────────────────────────
       WRITE – PROCESS ALL PAYROLL
    ───────────────────────────────────────── */

    @AuraEnabled
    public static void processAllPayroll(String invoiceMonth) {
        try {
            if (String.isBlank(invoiceMonth)) {
                throw new AuraHandledException('Invoice month is required.');
            }

            List<Account> accounts = [
                SELECT Id, Name, Basic_Salary__c, HRA__c, DA__c, PF_Deduction__c
                FROM Account
                WHERE IsPersonAccount = true
                  AND Type IN ('Teacher', 'Non Teaching Staff')
            ];

            if (accounts.isEmpty()) return;

            Set<Id> accountIds = new Map<Id, Account>(accounts).keySet();

            Map<Id, Invoice__c> existingMap = new Map<Id, Invoice__c>();
            for (Invoice__c inv : [
                SELECT Id, Account__c, Status__c FROM Invoice__c
                WHERE Invoice_Type__c  = 'Salary'
                  AND Invoice_Month__c = :invoiceMonth
                  AND Account__c IN    :accountIds
            ]) {
                existingMap.put(inv.Account__c, inv);
            }

            List<Invoice__c> toInsert = new List<Invoice__c>();
            List<Invoice__c> toUpdate = new List<Invoice__c>();

            for (Account acc : accounts) {
                Decimal basic = acc.Basic_Salary__c != null ? acc.Basic_Salary__c : 0;
                Decimal hra   = acc.HRA__c          != null ? acc.HRA__c          : 0;
                Decimal da    = acc.DA__c           != null ? acc.DA__c           : 0;
                Decimal pf    = acc.PF_Deduction__c != null ? acc.PF_Deduction__c : 0;
                Decimal net   = basic + hra + da - pf;

                if (existingMap.containsKey(acc.Id)) {
                    Invoice__c inv = existingMap.get(acc.Id);
                    inv.Status__c = 'Paid';
                    toUpdate.add(inv);
                } else {
                    Invoice__c inv = new Invoice__c();
                    inv.Account__c       = acc.Id;
                    inv.Invoice_Date__c  = Date.today();
                    inv.Due_Date__c      = Date.today();
                    inv.Status__c        = 'Paid';
                    inv.Total_Amount__c  = net;
                    inv.Invoice_Type__c  = 'Salary';
                    inv.Invoice_Month__c = invoiceMonth;
                    inv.Description__c   = 'Monthly salary for ' + invoiceMonth;
                    toInsert.add(inv);
                }
            }

            if (!toUpdate.isEmpty()) update toUpdate;
            if (!toInsert.isEmpty()) insert toInsert;

        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            throw new AuraHandledException('Error processing payroll: ' + e.getMessage());
        }
    }

    /* ─────────────────────────────────────────
       HELPER – NULL-SAFE STRING TRIM
       Converts null → '' so isBlank() works
       predictably; trims whitespace.
    ───────────────────────────────────────── */

    private static String safeStr(String val) {
        return val == null ? '' : val.trim();
    }

    /* ─────────────────────────────────────────
       HELPER – SALARY STATUS MAP
    ───────────────────────────────────────── */

    private static Map<Id, String> getSalaryStatusMap(Set<Id> accountIds) {
        Map<Id, String> result = new Map<Id, String>();
        if (accountIds == null || accountIds.isEmpty()) return result;

        for (Invoice__c inv : [
            SELECT Account__c, Status__c
            FROM Invoice__c
            WHERE Invoice_Type__c = 'Salary'
              AND Account__c IN   :accountIds
            ORDER BY Invoice_Date__c DESC
        ]) {
            if (!result.containsKey(inv.Account__c)) {
                result.put(inv.Account__c, inv.Status__c == 'Paid' ? 'Paid' : 'Pending');
            }
        }

        for (Id accId : accountIds) {
            if (!result.containsKey(accId)) {
                result.put(accId, 'Pending');
            }
        }
        return result;
    }

    /* ─────────────────────────────────────────
       HELPER – CONVERT ACCOUNT → WRAPPER
    ───────────────────────────────────────── */

    private static StaffWrapper toWrapper(Account acc, String salaryStatus) {
        StaffWrapper w = new StaffWrapper();
        w.id            = acc.Id;
        w.employeeId    = acc.Employee_ID__c;
        w.firstName     = acc.FirstName;
        w.lastName      = acc.LastName;
        w.name          = acc.Name;
        w.gender        = acc.PersonGenderIdentity;
        w.dob           = acc.PersonBirthdate  != null ? String.valueOf(acc.PersonBirthdate)  : '';
        w.email         = acc.PersonEmail;
        w.phone         = acc.PersonMobilePhone;
        w.address       = acc.PersonMailingStreet;
        w.staffType     = acc.Type == 'Teacher' ? 'Teaching' : 'Non-Teaching';
        w.designation   = acc.Designation__c;
        w.department    = acc.PersonDepartment;
        w.subject       = acc.Subject_Taught__c;
        w.qualification = acc.Qualification__c;
        w.joiningDate   = acc.Joining_Date__c  != null ? String.valueOf(acc.Joining_Date__c)  : '';
        w.status        = String.isNotBlank(acc.Staff_Status__c) ? acc.Staff_Status__c : 'Active';
        w.basicSalary   = acc.Basic_Salary__c  != null ? acc.Basic_Salary__c  : 0;
        w.hra           = acc.HRA__c           != null ? acc.HRA__c           : 0;
        w.da            = acc.DA__c            != null ? acc.DA__c            : 0;
        w.pf            = acc.PF_Deduction__c  != null ? acc.PF_Deduction__c  : 0;
        w.accountNumber = acc.Bank_Account_Number__c;
        w.ifsc          = acc.IFSC_Code__c;
        w.salaryStatus  = salaryStatus != null ? salaryStatus : 'Pending';
        return w;
    }

    /* ─────────────────────────────────────────
       HELPER – PERSON ACCOUNT RECORD TYPE ID
       Returns null safely if no PersonAccount
       RT exists (some orgs use a default RT).
    ───────────────────────────────────────── */

    private static Id getPersonAccountRecordTypeId() {
        try {
            List<RecordType> rt = [
                SELECT Id FROM RecordType
                WHERE SObjectType = 'Account'
                  AND IsPersonType = true
                  AND IsActive     = true
                LIMIT 1
            ];
            Id rtId = rt.isEmpty() ? null : rt[0].Id;
            System.debug('getPersonAccountRecordTypeId — rtId: ' + rtId);
            return rtId;
        } catch (Exception e) {
            System.debug('getPersonAccountRecordTypeId — error: ' + e.getMessage());
            return null;
        }
    }

    /* ─────────────────────────────────────────
       HELPER – GENERATE EMPLOYEE ID
    ───────────────────────────────────────── */

    private static String generateEmployeeId(Id accountId, String staffType) {
        String prefix  = (staffType == 'Teaching') ? 'TCH' : 'NTS';
        String shortId = String.valueOf(accountId).right(5).toUpperCase();
        return prefix + '-' + shortId;
    }
}