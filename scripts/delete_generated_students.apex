List<Account> accsToDelete = [
    SELECT Id 
    FROM Account 
    WHERE Type = 'Student' 
    AND CreatedDate = TODAY 
    AND (LastName LIKE '%Class%' OR LastName LIKE '%LKG%' OR LastName LIKE '%UKG%')
];

List<Opportunity> oppsToDelete = [SELECT Id FROM Opportunity WHERE AccountId IN :accsToDelete];
System.debug('Found ' + oppsToDelete.size() + ' opps to delete.');
if (!oppsToDelete.isEmpty()) {
    delete oppsToDelete;
}

System.debug('Found ' + accsToDelete.size() + ' students to delete.');
if (!accsToDelete.isEmpty()) {
    delete accsToDelete;
}
System.debug('Deleted successfully.');
