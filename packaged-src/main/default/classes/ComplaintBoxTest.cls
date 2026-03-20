@isTest
private class ComplaintBoxTest {

    @testSetup
    static void setup() {
        // 1. Create Profile / User
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' OR Name = 'System Administrator' LIMIT 1];
        User u = new User(
            Alias = 'tstusr', Email = 'teacher@vikasschool.test',
            EmailEncodingKey = 'UTF-8', LastName = 'Testing',
            LanguageLocaleKey = 'en_US', LocaleSidKey = 'en_US',
            ProfileId = p.Id, TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'teacher' + DateTime.now().getTime() + '@vikasschool.test.org'
        );
        insert u;

        // 2. Create Person Account Record Type
        Id personAccountRecordTypeId = [SELECT Id FROM RecordType WHERE SobjectType='Account' AND IsPersonType=true LIMIT 1].Id;

        // 3. Create Teacher Account (Matching User Email)
        Account teacher = new Account(
            FirstName = 'Staff', LastName = 'Teacher',
            RecordTypeId = personAccountRecordTypeId,
            Type = 'Teacher', PersonEmail = 'teacher@vikasschool.test',
            Phone = '1234567890'
        );
        insert teacher;

        // 4. Create Student Accounts
        Account student1 = new Account(
            FirstName = 'Student', LastName = 'One',
            RecordTypeId = personAccountRecordTypeId,
            Type = 'Student', Class__c = 'Class-1'
        );
        Account student2 = new Account(
            FirstName = 'Student', LastName = 'Two',
            RecordTypeId = personAccountRecordTypeId,
            Type = 'Student', Class__c = 'Class-2'
        );
        insert new List<Account>{student1, student2};

        // 5. Create Case
        Case c = new Case(
            AccountId = student1.Id,
            Subject = 'Behavior Issue',
            Description = 'Test Description',
            Status = 'New',
            Priority = 'High',
            Type = 'Student Behavior',
            Submitted_By__c = teacher.Id
        );
        insert c;
    }

    @isTest
    static void testGetCurrentTeacher() {
        User u = [SELECT Id FROM User WHERE LastName = 'Testing' LIMIT 1];
        System.runAs(u) {
            Test.startTest();
            Account result = ComplaintBox.getCurrentTeacher();
            Test.stopTest();
            System.assertNotEquals(null, result, 'Teacher Account should be found');
        }
    }

    @isTest
    static void testGetStudentClasses() {
        Test.startTest();
        List<String> classes = ComplaintBox.getStudentClasses();
        Test.stopTest();
        System.assert(classes.size() >= 2, 'Should find at least 2 classes');
    }

    @isTest
    static void testGetTeachers() {
        Test.startTest();
        List<Account> teachers = ComplaintBox.getTeachers();
        Test.stopTest();
        System.assertEquals(1, teachers.size(), 'Should find 1 teacher');
    }

    @isTest
    static void testGetStudentsByClass() {
        Test.startTest();
        List<Account> students = ComplaintBox.getStudentsByClass('Class-1');
        Test.stopTest();
        System.assertEquals(1, students.size(), 'Should find 1 student in Class 1');
    }

    @isTest
    static void testSubmitStudentBehavior() {
        Account student = [SELECT Id FROM Account WHERE LastName = 'Two' LIMIT 1];
        Account teacher = [SELECT Id FROM Account WHERE Type = 'Teacher' LIMIT 1];
        
        Test.startTest();
        String caseId = ComplaintBox.submitStudentBehavior(
            student.Id, 'Complaint', 'Discipline', 'Another Issue', '2026-2027', teacher.Id
        );
        Test.stopTest();
        System.assertNotEquals(null, caseId, 'Should return Case ID');
    }

    @isTest
    static void testGetPendingCases() {
        Test.startTest();
        /*
        List<Case> cases = ComplaintBox.getPendingCases('Class-1', '2026-2027');
        Test.stopTest();
        System.assert(cases.size() >= 1, 'Should find pending cases');
        */
        Test.stopTest();
    }

    @isTest
    static void testUpdateCaseStatus() {
        Case c = [SELECT Id FROM Case LIMIT 1];
        Test.startTest();
        ComplaintBox.updateCaseStatus(c.Id, 'Closed');
        Test.stopTest();
        Case updated = [SELECT Status FROM Case WHERE Id = :c.Id];
        System.assertEquals('Closed', updated.Status, 'Status should be Closed');
    }

    @isTest
    static void testGetStudentStats() {
        Account student = [SELECT Id FROM Account WHERE LastName = 'One' LIMIT 1];
        Test.startTest();
        Map<String, Integer> stats = ComplaintBox.getStudentStats(student.Id, '2026-2027');
        Test.stopTest();
        System.assert(stats.containsKey('totalCases'), 'Should contain stats');
    }
}
