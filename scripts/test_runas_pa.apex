User admin = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];

System.runAs(admin) {
    Account a = new Account(
        RecordTypeId = '012f6000000zlGXAAY',
        FirstName = 'RunAsFront',
        LastName = 'RunAsBack'
    );
    try {
        insert a;
        System.debug('Success = ' + a.Id);
    } catch (Exception e) {
        System.debug('Failed PA Insert: ' + e.getMessage());
    }
}
