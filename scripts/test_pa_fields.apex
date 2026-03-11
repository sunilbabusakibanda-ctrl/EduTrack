Account a = new Account(
    RecordTypeId = '012f6000000zlDJAAY',
    FirstName = 'TestFront',
    LastName = 'TestBack'
);
try {
    insert a;
    System.debug('Success F/L: ' + a.Id);
} catch (Exception e) {
    System.debug('Failed F/L: ' + e.getMessage());
}

Account b = new Account(
    RecordTypeId = '012f6000000zlDJAAY',
    Name = 'TestName'
);
try {
    insert b;
    System.debug('Success Name: ' + b.Id);
} catch (Exception e) {
    System.debug('Failed Name: ' + e.getMessage());
}
