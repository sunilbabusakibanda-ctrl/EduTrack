// Create Business Account
Account bAcc = new Account(Name = 'Convert Test');
insert bAcc;

// Create Contact
Contact c = new Contact(AccountId = bAcc.Id, FirstName = 'Convert', LastName = 'Test');
insert c;

// Update Account to Person Account
bAcc.RecordTypeId = '012f6000000zlGXAAY'; // True PA Record Type
try {
    update bAcc;
    System.debug('Successfully converted to Person Account! ' + bAcc.Id);
} catch (Exception e) {
    System.debug('Conversion failed: ' + e.getMessage());
}
