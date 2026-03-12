SchoolStaffController.StaffWrapper sw = new SchoolStaffController.StaffWrapper();
sw.firstName = 'Sakibanda';
sw.lastName = 'Sunil Babu';
sw.email = 'Sakibanda@gmail.com';
sw.phone = '8374331432';
sw.basicSalary = 50000;
sw.staffType = 'Teaching';
sw.designation = 'Senior Teacher';
sw.department = 'Science';
sw.status = 'Active';

try {
    String staffId = SchoolStaffController.upsertStaff(sw);
    System.debug('SUCCESS: ' + staffId);
} catch (Exception e) {
    System.debug('FAILURE: ' + e.getMessage());
}
