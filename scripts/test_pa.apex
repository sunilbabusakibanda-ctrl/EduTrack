RecordTypeInfo rti = Account.SObjectType.getDescribe().getRecordTypeInfosByDeveloperName().get('PersonAccount');

if (rti != null && rti.isAvailable()) {
    System.debug('Person Account Record Type IS available! ID: ' + rti.getRecordTypeId());
    Account a = new Account(
        RecordTypeId = rti.getRecordTypeId(),
        FirstName = 'Test2',
        LastName = 'PA2'
    );
    insert a;
    System.debug('Success = ' + a.Id);
} else {
    System.debug('Person Account IS STILL NOT AVAILABLE');
}
