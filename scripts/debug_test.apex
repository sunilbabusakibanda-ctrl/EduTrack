Academic_Year__c ay = new Academic_Year__c(Name='2024-2025', Is_Active__c=true, Start_Date__c=Date.today().addDays(-30), End_Date__c=Date.today().addDays(30));
insert ay;

Id personAccountRecordTypeId = [SELECT Id FROM RecordType WHERE SobjectType='Account' AND IsPersonType=true LIMIT 1].Id;
Account student = new Account(FirstName='Test', LastName='Student', RecordTypeId=personAccountRecordTypeId, Type='Student', Class__c=TestDataFactory.getValidClass(), Section__c='A', Roll_No__c='1');
insert student;

Class__c cls = new Class__c(Name=TestDataFactory.getValidClass()); insert cls;
Attendance_Session__c sess = new Attendance_Session__c(Class__c=cls.Id, Date__c=Date.today());
insert sess;
insert new Attendance__c(Student__c=student.Id, Attendance_Session__c=sess.Id, Attendance_Status__c='Absent', Date__c=Date.today());

System.debug('>>> DEBUG details.attendanceStats = ' + JSON.serialize(StudentController.getStudentDetails(student.Id).attendanceStats));
