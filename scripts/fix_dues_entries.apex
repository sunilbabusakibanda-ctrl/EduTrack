// Script to add PREV_DUES to any Pricebook that is missing it
Savepoint sp = Database.setSavepoint();
try {
    // 1. Get the PREV_DUES product
    List<Product2> duesProducts = [SELECT Id FROM Product2 WHERE ProductCode = 'PREV_DUES' LIMIT 1];
    if (duesProducts.isEmpty()) {
        System.debug('Error: PREV_DUES product not found.');
        return;
    }
    Id duesProdId = duesProducts[0].Id;

    // 2. Ensure Standard Price Book Entry exists
    Id standardPbId = null;
    if (Test.isRunningTest()) {
        standardPbId = Test.getStandardPricebookId();
    } else {
        List<Pricebook2> stdPb = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
        if (!stdPb.isEmpty()) standardPbId = stdPb[0].Id;
    }

    if (standardPbId != null) {
        List<PricebookEntry> stdPbe = [SELECT Id FROM PricebookEntry WHERE Pricebook2Id = :standardPbId AND Product2Id = :duesProdId LIMIT 1];
        if (stdPbe.isEmpty()) {
            insert new PricebookEntry(
                Pricebook2Id = standardPbId,
                Product2Id = duesProdId,
                UnitPrice = 0,
                IsActive = true,
                UseStandardPrice = false
            );
            System.debug('Added PREV_DUES to Standard Pricebook.');
        }
    }

    // 3. Find all Pricebooks that DO NOT have PREV_DUES (excluding standard)
    List<Pricebook2> allPbs = [SELECT Id, Name FROM Pricebook2 WHERE IsStandard = false];
    List<PricebookEntry> existingDues = [SELECT Pricebook2Id FROM PricebookEntry WHERE Product2Id = :duesProdId];
    
    Set<Id> pbsWithDues = new Set<Id>();
    for (PricebookEntry pbe : existingDues) {
        pbsWithDues.add(pbe.Pricebook2Id);
    }

    List<PricebookEntry> newPbes = new List<PricebookEntry>();
    for (Pricebook2 pb : allPbs) {
        if (!pbsWithDues.contains(pb.Id)) {
            newPbes.add(new PricebookEntry(
                Pricebook2Id = pb.Id,
                Product2Id = duesProdId,
                UnitPrice = 0,
                IsActive = true,
                UseStandardPrice = false
            ));
            System.debug('Will add PREV_DUES to: ' + pb.Name);
        }
    }

    // 4. Insert missing entries
    if (!newPbes.isEmpty()) {
        insert newPbes;
        System.debug('Successfully inserted ' + newPbes.size() + ' missing PREV_DUES entries.');
    } else {
        System.debug('All Pricebooks already have PREV_DUES.');
    }

} catch(Exception e) {
    Database.rollback(sp);
    System.debug('Error adding PREV_DUES to pricebooks: ' + e.getMessage());
}
