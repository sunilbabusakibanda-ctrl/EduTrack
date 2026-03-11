Id ayId = 'a07f600000641KIAAY'; // Academic Year 2025-2026
List<Opportunity> opps = [SELECT Id FROM Opportunity WHERE Class__c = 'Nursery' AND Academic_Year__c = :ayId AND StageName = 'Closed Won'];
for (Opportunity o : opps) {
    o.StageName = 'Prospecting';
}
update opps;
System.debug('Successfully updated ' + opps.size() + ' Nursery Admission Opportunities to Prospecting stage.');
