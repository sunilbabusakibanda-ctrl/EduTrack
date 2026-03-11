Account template = [SELECT Id, RecordTypeId FROM Account WHERE IsPersonAccount = true AND Name LIKE '%Safhi%' LIMIT 1];

Account newPA = template.clone(false, true, false, false);
newPA.FirstName = 'CloneTest';
newPA.LastName = 'ClonePA';
newPA.Class__c = 'Nursery';

try {
    insert newPA;
    System.debug('Successfully Cloned PA: ' + newPA.Id);
} catch (Exception e) {
    System.debug('Clone Error: ' + e.getMessage());
}
