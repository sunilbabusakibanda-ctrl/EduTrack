List<Opportunity> nurseryOpps = [SELECT Id, Pricebook2Id 
                                 FROM Opportunity 
                                 WHERE Account.Class__c = 'Nursery' 
                                 AND CreatedDate = TODAY
                                 AND Account.RecordType.DeveloperName = 'PersonAccount'];

List<Pricebook2> pbs = [SELECT Id FROM Pricebook2 WHERE Name LIKE 'Nursery%' AND IsActive = true];
Id defaultPb = !pbs.isEmpty() ? pbs[0].Id : null;

if (defaultPb == null) {
    System.debug('Error: No active Nursery pricebook found.');
    return;
}

List<PricebookEntry> activeProducts = [SELECT Id, UnitPrice 
                                       FROM PricebookEntry 
                                       WHERE Pricebook2Id = :defaultPb 
                                       AND IsActive = true];

if (activeProducts.isEmpty()) {
    System.debug('Error: No active products found in the Nursery pricebook.');
    return;
}

List<Opportunity> oppsToUpdate = new List<Opportunity>();
List<OpportunityLineItem> newLines = new List<OpportunityLineItem>();

for (Opportunity opp : nurseryOpps) {
    if (opp.Pricebook2Id != defaultPb) {
        opp.Pricebook2Id = defaultPb;
        oppsToUpdate.add(opp);
    }
    
    for (PricebookEntry pbe : activeProducts) {
        newLines.add(new OpportunityLineItem(
            OpportunityId = opp.Id,
            PricebookEntryId = pbe.Id,
            Quantity = 1,
            UnitPrice = pbe.UnitPrice
        ));
    }
}

Savepoint sp = Database.setSavepoint();
try {
    if (!oppsToUpdate.isEmpty()) {
        update oppsToUpdate;
    }
    if (!newLines.isEmpty()) {
        insert newLines;
        System.debug('Successfully inserted ' + newLines.size() + ' fee items across ' + nurseryOpps.size() + ' students.');
    }
} catch (Exception e) {
    Database.rollback(sp);
    System.debug('Error adding products: ' + e.getMessage());
}
