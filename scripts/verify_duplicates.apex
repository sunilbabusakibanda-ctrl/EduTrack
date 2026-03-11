String sourceYearId = 'a07f600000641KIAAY';
String targetYearId = 'a07f60000067RlEAAU';

// Pick 3 students from Class-3
List<Opportunity> candidates = [SELECT AccountId, Account.Class__c FROM Opportunity WHERE Academic_Year__c = :sourceYearId AND Account.Class__c = 'Class-3' AND IsClosed = false LIMIT 3];
System.debug('Initial Candidates: ' + candidates.size());

if(candidates.size() >= 1) {
    List<Id> sIds = new List<Id>{ candidates[0].AccountId };
    
    // Promote 1 student
    PromotionController.promoteStudents(sIds, sourceYearId, targetYearId, 'ALL', null, new List<Id>());
    System.debug('Promoted 1 student');
    
    // Check remaining candidates
    List<Opportunity> remaining = [SELECT AccountId FROM Opportunity WHERE Academic_Year__c = :sourceYearId AND Account.Class__c = 'Class-3' AND IsClosed = false];
    System.debug('Remaining Candidates for Class-3: ' + remaining.size());
    
    // Check their new Opportunity Name
    List<Opportunity> promotedOpp = [SELECT Name FROM Opportunity WHERE AccountId = :candidates[0].AccountId AND Academic_Year__c = :targetYearId];
    if(!promotedOpp.isEmpty()) {
        System.debug('New Opportunity Name: ' + promotedOpp[0].Name);
    }
}
