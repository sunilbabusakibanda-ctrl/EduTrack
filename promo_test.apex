// Find test records
Opportunity oldOpp = [SELECT AccountId, Academic_Year__c FROM Opportunity WHERE StageName != 'Closed Won' LIMIT 1];
String sourceYear = oldOpp.Academic_Year__c;
String targetYear = [SELECT Id FROM Academic_Year__c WHERE Id != :sourceYear LIMIT 1].Id;
System.debug('Promoting Account: ' + oldOpp.AccountId);

try {
    PromotionController.promoteStudents(
        new List<Id>{oldOpp.AccountId}, 
        sourceYear, 
        targetYear, 
        'ALL', 
        null, 
        new List<Id>()
    );
    System.debug('Promotion Success!');
} catch (Exception e) {
    System.debug('Promotion Failed: ' + e.getMessage());
    System.debug('Stack Trace: ' + e.getStackTraceString());
}
