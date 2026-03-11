Id ayId = [SELECT Id, Name FROM Academic_Year__c WHERE Name LIKE '%2025%' LIMIT 1].Id;
String ayName = [SELECT Name FROM Academic_Year__c WHERE Id = :ayId LIMIT 1].Name;

List<Account> newNurseryStudents = [SELECT Id, Name, Class__c, Section__c 
                                    FROM Account 
                                    WHERE Class__c = 'Nursery' 
                                    AND CreatedDate = TODAY
                                    AND RecordType.DeveloperName = 'PersonAccount'];

List<Pricebook2> pbs = [SELECT Id, Name FROM Pricebook2 WHERE Name LIKE 'Nursery%' AND IsActive = true];
Id defaultPb = !pbs.isEmpty() ? pbs[0].Id : null;

List<Opportunity> newAdmissions = new List<Opportunity>();

for (Account acc : newNurseryStudents) {
    String oppName = acc.Name + ' - Admission ' + ayName + ' (Nursery)';
    
    Opportunity opp = new Opportunity(
        Name = oppName.left(120),
        AccountId = acc.Id,
        StageName = 'Prospecting',
        CloseDate = Date.today().addDays(30),
        Class__c = acc.Class__c,
        Section__c = acc.Section__c,
        Academic_Year__c = ayId
    );
    
    if (defaultPb != null) {
        opp.Pricebook2Id = defaultPb;
    }

    newAdmissions.add(opp);
}

try {
    insert newAdmissions;
    System.debug('Successfully created ' + newAdmissions.size() + ' Admission Opportunities for Nursery.');
} catch (Exception e) {
    System.debug('Error creating Admissions: ' + e.getMessage());
}
