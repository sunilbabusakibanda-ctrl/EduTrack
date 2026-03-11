String sourceYearId = 'a07f600000641KIAAY';
String targetYearId = 'a07f60000067RlEAAU';

List<Map<String, String>> classSectionPairs = new List<Map<String, String>>();
classSectionPairs.add(new Map<String, String>{'className' => 'Class-10', 'section' => 'A'});
classSectionPairs.add(new Map<String, String>{'className' => 'Class-2', 'section' => 'A'});
classSectionPairs.add(new Map<String, String>{'className' => 'Class-4', 'section' => 'A'});

Savepoint sp = Database.setSavepoint();
try {
    PromotionController.promoteClasses(sourceYearId, targetYearId, classSectionPairs, new List<Id>());
    System.debug('PromoteClasses executed successfully');
    
    // Check if new opps were created
    List<Opportunity> newOpps = [SELECT Id, Name, Class__c FROM Opportunity WHERE Academic_Year__c = :targetYearId];
    System.debug('New Opps count: ' + newOpps.size());
} catch (Exception e) {
    System.debug('Error in promoteClasses: ' + e.getMessage() + '\n' + e.getStackTraceString());
} finally {
    Database.rollback(sp);
    System.debug('Rolled back changes');
}
