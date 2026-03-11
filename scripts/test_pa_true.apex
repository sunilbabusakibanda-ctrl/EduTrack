Account a = new Account(
    RecordTypeId = '012f6000000zlGXAAY',
    FirstName = 'TestTruePA',
    LastName = 'TruePA'
);
try {
    insert a;
    System.debug('Success = ' + a.Id);
} catch (Exception e) {
    System.debug('Failed PA Insert: ' + e.getMessage());
}
