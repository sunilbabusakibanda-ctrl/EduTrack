List<Account> accs = [SELECT Id, Name FROM Account WHERE Name LIKE '%Aravind%'];
if (!accs.isEmpty()) {
    Id accId = accs[0].Id;
    List<Opportunity> opps = [SELECT Id, Name, StageName, Academic_Year__c FROM Opportunity WHERE AccountId = :accId ORDER BY CreatedDate ASC];
    System.debug('ARAVIND_OPPS: ' + JSON.serialize(opps));
    
    List<OpportunityLineItem> items = [SELECT Id, OpportunityId, Product2.Name, Product2.ProductCode, UnitPrice, TotalPrice FROM OpportunityLineItem WHERE Opportunity.AccountId = :accId];
    System.debug('ARAVIND_ITEMS: ' + JSON.serialize(items));
    
    List<Invoice__c> invs = [SELECT Id, Status__c, (SELECT Amount__c FROM Invoice_Items__r) FROM Invoice__c WHERE Student__c = :accId];
    System.debug('ARAVIND_INVS: ' + JSON.serialize(invs));
}
