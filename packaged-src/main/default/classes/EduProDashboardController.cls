public with sharing class EduProDashboardController {

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getDashboardMetrics() {
        Map<String, Object> metrics = new Map<String, Object>();
        
        // 1. Total Students
        Integer totalStudents = [SELECT COUNT() FROM Account WHERE Type = 'Student'];
        metrics.put('totalStudents', totalStudents);
        
        // 2. Revenue This Month
        AggregateResult[] arRevenue = [
            SELECT SUM(Amount__c) totalRevenue 
            FROM Invoice_Item__c 
            WHERE Invoice__r.Status__c = 'Paid' 
            //AND THIS_MONTH (Simplifying to all paid for demonstration of calculation, could be restricted)
        ];
        Decimal revenue = (Decimal)arRevenue[0].get('totalRevenue');
        metrics.put('totalRevenue', revenue != null ? revenue : 0);
        
        // 3. Recent Admissions (3 most recent students created)
        List<Account> recentStudents = [
            SELECT Id, Name, Roll_No__c, Class__c 
            FROM Account 
            WHERE Type = 'Student' 
            ORDER BY CreatedDate DESC 
            LIMIT 50
        ];
        
        List<Map<String, String>> recentAdmissions = new List<Map<String, String>>();
        for (Account acc : recentStudents) {
            Map<String, String> adm = new Map<String, String>();
            adm.put('id', String.isNotBlank(acc.Roll_No__c) ? acc.Roll_No__c : '');
            adm.put('name', acc.Name);
            adm.put('class', String.isNotBlank(acc.Class__c) ? acc.Class__c : 'N/A');
            adm.put('status', 'Active');
            
            // Generate Avatar (Initials)
            String initials = '';
            List<String> parts = acc.Name.split(' ');
            if (parts.size() > 0 && String.isNotBlank(parts[0])) initials += parts[0].substring(0, 1);
            if (parts.size() > 1 && String.isNotBlank(parts[1])) initials += parts[1].substring(0, 1);
            adm.put('avatar', initials.toUpperCase());
            
            recentAdmissions.add(adm);
        }
        metrics.put('recentAdmissions', recentAdmissions);
        
        // 4. Payment Overview (3 most recent invoices)
        List<Invoice__c> recentInvoices = [
            SELECT Id, Name, Student__r.Name, Status__c,
                   (SELECT Amount__c FROM Invoice_Items__r)
            FROM Invoice__c 
            ORDER BY CreatedDate DESC 
            LIMIT 50
        ];
        
        List<Map<String, String>> paymentOverview = new List<Map<String, String>>();
        for (Invoice__c inv : recentInvoices) {
            Map<String, String> pay = new Map<String, String>();
            pay.put('id', inv.Name);
            pay.put('name', (inv.Student__r.Name != null ? inv.Student__r.Name : 'Unknown') + ' - Invoice');
            
            Decimal amt = 0;
            if (inv.Invoice_Items__r != null) {
                for (Invoice_Item__c item : inv.Invoice_Items__r) {
                    if (item.Amount__c != null) amt += item.Amount__c;
                }
            }
            
            pay.put('amount', '₹' + amt.format());
            
            String status = inv.Status__c != null ? inv.Status__c : 'Pending';
            pay.put('status', status);
            
            String statusClass = 'badge-pending';
            if (status == 'Paid') statusClass = 'badge-paid';
            else if (status == 'Partial') statusClass = 'badge-partial';
            else if (status == 'Overdue') statusClass = 'badge-overdue';
            
            pay.put('statusClass', statusClass);
            paymentOverview.add(pay);
        }
        metrics.put('paymentOverview', paymentOverview);

        // 5. Avg Attendance Logic
        metrics.put('avgAttendance', calculateAvgAttendance());

        // 6. Avg Academic Score Logic
        metrics.put('avgAcademicScore', calculateAvgAcademicScore());
        
        // 7. Trends
        metrics.put('studentTrend', calculateStudentTrend());
        metrics.put('revenueTrend', calculateRevenueTrend());
        metrics.put('attendanceTrend', calculateAttendanceTrend());
        metrics.put('scoreTrend', calculateScoreTrend());
        
        return metrics;
    }

    @AuraEnabled
    public static List<Map<String, String>> getAllRecentAdmissions() {
        List<Account> students = [
            SELECT Id, Name, Roll_No__c, Class__c 
            FROM Account 
            WHERE Type = 'Student' 
            ORDER BY CreatedDate DESC 
            LIMIT 50
        ];
        
        List<Map<String, String>> allAdmissions = new List<Map<String, String>>();
        for (Account acc : students) {
            Map<String, String> adm = new Map<String, String>();
            adm.put('id', String.isNotBlank(acc.Roll_No__c) ? acc.Roll_No__c : '');
            adm.put('name', acc.Name);
            adm.put('class', String.isNotBlank(acc.Class__c) ? acc.Class__c : 'N/A');
            adm.put('status', 'Active');
            
            String initials = '';
            List<String> parts = acc.Name.split(' ');
            if (parts.size() > 0 && String.isNotBlank(parts[0])) initials += parts[0].substring(0, 1);
            if (parts.size() > 1 && String.isNotBlank(parts[1])) initials += parts[1].substring(0, 1);
            adm.put('avatar', initials.toUpperCase());
            
            allAdmissions.add(adm);
        }
        return allAdmissions;
    }

    @AuraEnabled
    public static List<Map<String, String>> getAllRecentPayments() {
        List<Invoice__c> invoices = [
            SELECT Id, Name, Student__r.Name, Status__c,
                   (SELECT Amount__c FROM Invoice_Items__r)
            FROM Invoice__c 
            ORDER BY CreatedDate DESC 
            LIMIT 50
        ];
        
        List<Map<String, String>> allPayments = new List<Map<String, String>>();
        for (Invoice__c inv : invoices) {
            Map<String, String> pay = new Map<String, String>();
            pay.put('id', inv.Name);
            pay.put('name', (inv.Student__r.Name != null ? inv.Student__r.Name : 'Unknown') + ' - Invoice');
            
            Decimal amt = 0;
            if (inv.Invoice_Items__r != null) {
                for (Invoice_Item__c item : inv.Invoice_Items__r) {
                    if (item.Amount__c != null) amt += item.Amount__c;
                }
            }
            
            pay.put('amount', '₹' + amt.format());
            
            String status = inv.Status__c != null ? inv.Status__c : 'Pending';
            pay.put('status', status);
            
            String statusClass = 'badge-pending';
            if (status == 'Paid') statusClass = 'badge-paid';
            else if (status == 'Partial') statusClass = 'badge-partial';
            else if (status == 'Overdue') statusClass = 'badge-overdue';
            
            pay.put('statusClass', statusClass);
            allPayments.add(pay);
        }
        return allPayments;
    }


    private static Double calculateAvgAttendance() {
        List<Academic_Year__c> ays = [SELECT Start_Date__c, End_Date__c FROM Academic_Year__c WHERE Is_Active__c = true LIMIT 1];
        if (ays.isEmpty()) return 0;
        Academic_Year__c ay = ays[0];

        Integer totalStudents = [SELECT COUNT() FROM Account WHERE Type = 'Student'];
        if (totalStudents == 0) return 0;

        Integer totalWorkingDays = [SELECT COUNT() FROM Attendance_Session__c WHERE Date__c >= :ay.Start_Date__c AND Date__c <= :ay.End_Date__c];
        if (totalWorkingDays == 0) return 0;

        Integer totalAbsences = [
            SELECT COUNT() 
            FROM Attendance__c 
            WHERE Attendance_Status__c = 'Absent' 
            AND Attendance_Session__r.Date__c >= :ay.Start_Date__c 
            AND Attendance_Session__r.Date__c <= :ay.End_Date__c
        ];

        Double totalPossibilities = (Double)totalWorkingDays * totalStudents;
        Double presentCount = totalPossibilities - totalAbsences;
        return (presentCount / totalPossibilities) * 100;
    }

    private static Double calculateAvgAcademicScore() {
        List<Exam__c> exams = [
            SELECT English__c, Maths__c, Science__c, Social__c, Computer__c, Telugu__c, Hindi__c 
            FROM Exam__c
        ];
        if (exams.isEmpty()) return 0;

        Double totalPercent = 0;
        Integer count = 0;

        for (Exam__c e : exams) {
            Double obtainedSize = 0;
            Integer subjects = 0;
            
            if (String.isNotBlank(e.English__c)) { obtainedSize += Double.valueOf(e.English__c); subjects++; }
            if (String.isNotBlank(e.Maths__c)) { obtainedSize += Double.valueOf(e.Maths__c); subjects++; }
            if (String.isNotBlank(e.Science__c)) { obtainedSize += Double.valueOf(e.Science__c); subjects++; }
            if (String.isNotBlank(e.Social__c)) { obtainedSize += Double.valueOf(e.Social__c); subjects++; }
            if (String.isNotBlank(e.Computer__c)) { obtainedSize += Double.valueOf(e.Computer__c); subjects++; }
            if (String.isNotBlank(e.Telugu__c)) { obtainedSize += Double.valueOf(e.Telugu__c); subjects++; }
            if (e.Hindi__c != null) { obtainedSize += e.Hindi__c; subjects++; }

            if (subjects > 0) {
                totalPercent += (obtainedSize / (subjects * 100)) * 100;
                count++;
            }
        }

        return count > 0 ? (totalPercent / count) : 0;
    }

    private static Double calculateExamAvg(List<Exam__c> exams) {
        if (exams.isEmpty()) return 0;
        Double totalPercent = 0;
        Integer count = 0;
        for (Exam__c e : exams) {
            Double obtainedSize = 0;
            Integer subjects = 0;
            
            if (String.isNotBlank(e.English__c)) { obtainedSize += Double.valueOf(e.English__c); subjects++; }
            if (String.isNotBlank(e.Maths__c)) { obtainedSize += Double.valueOf(e.Maths__c); subjects++; }
            if (String.isNotBlank(e.Science__c)) { obtainedSize += Double.valueOf(e.Science__c); subjects++; }
            if (String.isNotBlank(e.Social__c)) { obtainedSize += Double.valueOf(e.Social__c); subjects++; }
            if (String.isNotBlank(e.Computer__c)) { obtainedSize += Double.valueOf(e.Computer__c); subjects++; }
            if (String.isNotBlank(e.Telugu__c)) { obtainedSize += Double.valueOf(e.Telugu__c); subjects++; }
            if (e.Hindi__c != null) { obtainedSize += e.Hindi__c; subjects++; }

            if (subjects > 0) {
                totalPercent += (obtainedSize / (subjects * 100)) * 100;
                count++;
            }
        }
        return count > 0 ? (totalPercent / count) : 0;
    }

    private static Double calculateStudentTrend() {
        Integer thisYear = [SELECT COUNT() FROM Account WHERE Type = 'Student' AND CreatedDate = THIS_YEAR];
        Integer lastYear = [SELECT COUNT() FROM Account WHERE Type = 'Student' AND CreatedDate = LAST_YEAR];
        if (lastYear == 0) return thisYear > 0 ? 100.0 : 0.0;
        return ((Double)(thisYear - lastYear) / lastYear) * 100.0;
    }

    private static Double calculateRevenueTrend() {
        AggregateResult[] thisYearAr = [SELECT SUM(Amount__c) total FROM Invoice_Item__c WHERE Invoice__r.Status__c = 'Paid' AND CreatedDate = THIS_YEAR];
        AggregateResult[] lastYearAr = [SELECT SUM(Amount__c) total FROM Invoice_Item__c WHERE Invoice__r.Status__c = 'Paid' AND CreatedDate = LAST_YEAR];
        
        Decimal thisYear = (Decimal)thisYearAr[0].get('total');
        Decimal lastYear = (Decimal)lastYearAr[0].get('total');
        
        if (thisYear == null) thisYear = 0;
        if (lastYear == null) lastYear = 0;
        
        if (lastYear == 0) return thisYear > 0 ? 100.0 : 0.0;
        return ((Double)(thisYear - lastYear) / (Double)lastYear) * 100.0;
    }

    private static Double calculateAttendanceTrend() {
        Integer tyWorkingDays = [SELECT COUNT() FROM Attendance_Session__c WHERE Date__c = THIS_YEAR];
        Integer tyAbsences = [SELECT COUNT() FROM Attendance__c WHERE Attendance_Status__c = 'Absent' AND Attendance_Session__r.Date__c = THIS_YEAR];
        
        Integer lyWorkingDays = [SELECT COUNT() FROM Attendance_Session__c WHERE Date__c = LAST_YEAR];
        Integer lyAbsences = [SELECT COUNT() FROM Attendance__c WHERE Attendance_Status__c = 'Absent' AND Attendance_Session__r.Date__c = LAST_YEAR];
        
        Integer totalStudents = [SELECT COUNT() FROM Account WHERE Type = 'Student'];
        if (totalStudents == 0) return 0.0;
        
        Double tyPercent = 0.0;
        if (tyWorkingDays > 0) {
            Double totalPossibilities = (Double)tyWorkingDays * totalStudents;
            tyPercent = ((totalPossibilities - tyAbsences) / totalPossibilities) * 100.0;
        }
        
        Double lyPercent = 0.0;
        if (lyWorkingDays > 0) {
            Double totalPossibilities = (Double)lyWorkingDays * totalStudents;
            lyPercent = ((totalPossibilities - lyAbsences) / totalPossibilities) * 100.0;
        }
        
        if (lyPercent == 0) return tyPercent > 0 ? 100.0 : 0.0;
        return ((tyPercent - lyPercent) / lyPercent) * 100.0;
    }

    private static Double calculateScoreTrend() {
        List<Exam__c> tyExams = [SELECT English__c, Maths__c, Science__c, Social__c, Computer__c, Telugu__c, Hindi__c FROM Exam__c WHERE CreatedDate = THIS_YEAR];
        List<Exam__c> lyExams = [SELECT English__c, Maths__c, Science__c, Social__c, Computer__c, Telugu__c, Hindi__c FROM Exam__c WHERE CreatedDate = LAST_YEAR];
        
        Double tyScore = calculateExamAvg(tyExams);
        Double lyScore = calculateExamAvg(lyExams);
        
        if (lyScore == 0) return tyScore > 0 ? 100.0 : 0.0;
        return ((tyScore - lyScore) / lyScore) * 100.0;
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getSchoolSetup() {
        School_Setup__c setup = School_Setup__c.getOrgDefaults();
        Map<String, Object> result = new Map<String, Object>();
        result.put('schoolName', setup.School_Name__c != null ? setup.School_Name__c : 'EDU PRO SYSTEM');
        result.put('schoolLogo', setup.School_Logo__c);
        result.put('schoolSubtitle', setup.School_Subtitle__c != null ? setup.School_Subtitle__c : 'Powered by Salesforce');
        result.put('isSetupCompleted', setup.Setup_Completed__c == true);
        return result;
    }
    @AuraEnabled(cacheable=true)
    public static Map<String, List<Map<String, String>>> globalSearch(String searchTerm) {
        Map<String, List<Map<String, String>>> results = new Map<String, List<Map<String, String>>>();
        if (String.isBlank(searchTerm) || searchTerm.length() < 2) {
            return results;
        }

        String searchPattern = '%' + searchTerm + '%';

        // 1. Search Students
        List<Account> students = [
            SELECT Id, Name, Roll_No__c, Class__c 
            FROM Account 
            WHERE Type = 'Student' 
            AND (Name LIKE :searchPattern OR Roll_No__c LIKE :searchPattern)
            ORDER BY Name ASC
            LIMIT 10
        ];
        List<Map<String, String>> studentResults = new List<Map<String, String>>();
        for (Account acc : students) {
            Map<String, String> item = new Map<String, String>();
            item.put('id', acc.Id);
            item.put('title', acc.Name);
            item.put('subtitle', 'Student | ' + (acc.Class__c != null ? acc.Class__c : 'N/A') + (acc.Roll_No__c != null ? ' | ' + acc.Roll_No__c : ''));
            item.put('type', 'student');
            studentResults.add(item);
        }
        results.put('results', studentResults);

        // 2. Search Invoices
        List<Invoice__c> invoices = [
            SELECT Id, Name, Student__r.Name, Student__c 
            FROM Invoice__c 
            WHERE Name LIKE :searchPattern OR Student__r.Name LIKE :searchPattern
            ORDER BY CreatedDate DESC
            LIMIT 10
        ];
        for (Invoice__c inv : invoices) {
            Map<String, String> item = new Map<String, String>();
            item.put('id', inv.Id);
            item.put('studentId', inv.Student__c);
            item.put('title', 'Invoice ' + inv.Name);
            item.put('subtitle', 'Invoice | ' + (inv.Student__r.Name != null ? inv.Student__r.Name : 'N/A'));
            item.put('type', 'invoice');
            results.get('results').add(item);
        }

        return results;
    }
}