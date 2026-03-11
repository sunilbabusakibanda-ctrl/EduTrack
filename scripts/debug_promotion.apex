String sourceYearId = 'a07f600000641KIAAY';
List<Map<String, String>> classSectionPairs = new List<Map<String, String>>();
classSectionPairs.add(new Map<String, String>{'className' => 'Class-10', 'section' => 'A'});
classSectionPairs.add(new Map<String, String>{'className' => 'Class-2', 'section' => 'A'});

Set<Id> studentIds = new Set<Id>();
for (Map<String, String> pair : classSectionPairs) {
    String className = pair.get('className');
    String section = pair.get('section');

    System.debug('Checking Class: ' + className + ', Section: ' + section);

    for (Opportunity opp : [
        SELECT AccountId
        FROM Opportunity
        WHERE Academic_Year__c = :sourceYearId
        AND Class__c = :className
        AND Section__c = :section
        AND Account.Type = 'Student'
    ]) {
        studentIds.add(opp.AccountId);
    }
}
System.debug('Total studentIds matched: ' + studentIds.size());
System.debug('studentIds: ' + studentIds);

List<Opportunity> allOpps = [SELECT AccountId, Class__c, Section__c FROM Opportunity WHERE Academic_Year__c = :sourceYearId LIMIT 10];
System.debug('Sample Opps (any class/section): ' + JSON.serialize(allOpps));
