Id accId = [SELECT Id FROM Account WHERE Name LIKE '%Aravind Gudipat%' LIMIT 1].Id;

// 1. Calculate Aravind's previous balance from 2026-2027 (a07f60000067RlEAAU)
Opportunity oldOpp = [SELECT Id, Academic_Year__c FROM Opportunity WHERE AccountId = :accId AND Academic_Year__c = 'a07f60000067RlEAAU' LIMIT 1];
AggregateResult sumAllocated = [SELECT SUM(TotalPrice) total FROM OpportunityLineItem WHERE OpportunityId = :oldOpp.Id];
Decimal allocated = (Decimal)sumAllocated.get('total');

AggregateResult sumPaid = [SELECT SUM(Amount__c) paid FROM Invoice_Item__c WHERE Invoice__r.Student__c = :accId AND Invoice__r.Opportunity__c = :oldOpp.Id AND Invoice__r.Status__c = 'Paid'];
Decimal paid = (sumPaid.get('paid') != null) ? (Decimal)sumPaid.get('paid') : 0;

Decimal pendingBalance = allocated - paid;
System.debug('Aravind Pending Balance: ' + pendingBalance);

// 2. Find his new 2027-2028 Opportunity
Opportunity newOpp = [SELECT Id, Pricebook2Id FROM Opportunity WHERE AccountId = :accId AND Academic_Year__c = 'a07f6000006IGrTAAW' LIMIT 1];

// 3. Find the PREV_DUES PricebookEntry for that specific Pricebook
Id duesPbId = [SELECT Id FROM PricebookEntry WHERE Pricebook2Id = :newOpp.Pricebook2Id AND Product2.ProductCode = 'PREV_DUES' LIMIT 1].Id;

// 4. Check if it's already there to prevent duplicates
List<OpportunityLineItem> existingDues = [SELECT Id FROM OpportunityLineItem WHERE OpportunityId = :newOpp.Id AND PricebookEntryId = :duesPbId];

if (existingDues.isEmpty() && pendingBalance > 0) {
    insert new OpportunityLineItem(
        OpportunityId = newOpp.Id,
        PricebookEntryId = duesPbId,
        Quantity = 1,
        UnitPrice = pendingBalance
    );
    System.debug('Successfully carried forward balance!');
} else {
    System.debug('Balance already carried forward or is 0.');
}
