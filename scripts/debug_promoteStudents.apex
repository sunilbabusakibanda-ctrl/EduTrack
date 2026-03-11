String sourceYearId = 'a07f600000641KIAAY';
String targetYearId = 'a07f60000067RlEAAU';
// Get a handful of students from source year who are NOT in Class-10
List<Opportunity> opps = [SELECT AccountId, Account.Class__c FROM Opportunity WHERE Academic_Year__c = :sourceYearId AND Account.Type = 'Student' AND Class__c != 'Class-10' LIMIT 2];

List<Id> sIds = new List<Id>();
for (Opportunity o : opps) {
    sIds.add(o.AccountId);
    System.debug('Found student: ' + o.AccountId + ' in class: ' + o.Account.Class__c);
}

Savepoint sp = Database.setSavepoint();
try {
    PromotionController.promoteStudents(sIds, sourceYearId, targetYearId, 'ALL', null, new List<Id>());
    System.debug('PromoteStudents executed successfully');
    
    // Check if new opps were created
    List<Opportunity> newOpps = [SELECT Id, Name, Class__c FROM Opportunity WHERE AccountId IN :sIds AND Academic_Year__c = :targetYearId];
    System.debug('New Opps count: ' + newOpps.size());
    for(Opportunity o : newOpps) {
        System.debug('New Opp: ' + o.Name + ' | Class: ' + o.Class__c);
    }
} catch (Exception e) {
    System.debug('Error in promoteStudents: ' + e.getMessage() + '\n' + e.getStackTraceString());
} finally {
    Database.rollback(sp);
    System.debug('Rolled back changes');
}
