Id ayId = 'a07f600000641KIAAY'; // Academic Year 2025-2026

// Get Nursery students created today
List<Account> students = [SELECT Id, Name, Section__c FROM Account WHERE Class__c = 'Nursery' AND CreatedDate = TODAY];

List<Opportunity> opps = new List<Opportunity>();
for (Account s : students) {
    opps.add(new Opportunity(
        AccountId = s.Id,
        Name = 'Admission - ' + s.Name,
        CloseDate = Date.newInstance(2025, 6, 1),
        StageName = 'Closed Won',
        Class__c = 'Nursery',
        Section__c = s.Section__c,
        Academic_Year__c = ayId,
        Pricebook2Id = '01sf6000002GQYUAA4' // Standard Pricebook
    ));
}
insert opps;

// Associate Fees (Opportunity Line Items)
Map<String, Id> feeMap = new Map<String, Id>{
    'Admission Fee' => '01uf6000000O381AAC',
    'Tuition Fee' => '01uf6000000NGCAAA4',
    'School Uniform' => '01uf6000000N4itAAC',
    'Books fee' => '01uf6000000N5v3AAC',
    'sports fee' => '01uf6000000NYozAAG'
};

List<OpportunityLineItem> olis = new List<OpportunityLineItem>();
for (Opportunity o : opps) {
    for (String feeName : feeMap.keySet()) {
        olis.add(new OpportunityLineItem(
            OpportunityId = o.Id,
            PricebookEntryId = feeMap.get(feeName),
            Quantity = 1,
            UnitPrice = (feeName == 'Admission Fee' ? 15000 : 
                        (feeName == 'Tuition Fee' ? 30000 :
                        (feeName == 'School Uniform' ? 3500 :
                        (feeName == 'Books fee' ? 5000 : 1000))))
        ));
    }
}
insert olis;

System.debug('Successfully inserted ' + opps.size() + ' Admissions and ' + olis.size() + ' Fee Line Items.');
