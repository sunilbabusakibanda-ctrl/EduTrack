List<Account> accsToDelete = [
    SELECT Id 
    FROM Account 
    WHERE Type = 'Student' 
    AND PersonEmail LIKE '%@example.com'
    AND Class__c IN ('LKG', 'UKG', 'Class-1', 'Class-2', 'Class-3', 'Class-4', 'Class-5', 'Class-6', 'Class-7', 'Class-8', 'Class-9', 'Class-10')
];

List<Opportunity> oppsToDelete = [SELECT Id FROM Opportunity WHERE AccountId IN :accsToDelete];
System.debug('Found ' + oppsToDelete.size() + ' opps to delete.');
if (!oppsToDelete.isEmpty()) {
    // OpportunityLineItems are deleted automatically
    delete oppsToDelete;
}

System.debug('Found ' + accsToDelete.size() + ' students to delete.');
if (!accsToDelete.isEmpty()) {
    delete accsToDelete;
}
System.debug('Deleted successfully.');
