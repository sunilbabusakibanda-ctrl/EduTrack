SchoolStaffController.StaffWrapper sw = new SchoolStaffController.StaffWrapper();
sw.firstName = 'Test';
sw.lastName = 'Staff';
sw.email = 'teststaff@example.com';
sw.phone = '1234567890';
sw.basicSalary = 10000;
sw.staffType = 'Teaching';
sw.designation = 'Teacher';
sw.department = 'Science';
sw.status = 'Active';

try {
    String staffId = SchoolStaffController.upsertStaff(sw);
    System.debug('Successfully saved staff with ID: ' + staffId);
    Account acc = [SELECT Employee_ID__c FROM Account WHERE Id = :staffId];
    System.debug('Generated Employee ID: ' + acc.Employee_ID__c);
} catch (Exception e) {
    System.debug('Error saving staff: ' + e.getMessage());
    System.debug('Stack Trace: ' + e.getStackTraceString());
}
