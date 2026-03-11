List<Account> accs = [SELECT Id, Name FROM Account WHERE Name LIKE '%Aravind%'];
if (!accs.isEmpty()) {
    Id accId = accs[0].Id;
    List<OpportunityLineItem> items = [SELECT Id, Opportunity.Name, Product2.Name, UnitPrice, TotalPrice FROM OpportunityLineItem WHERE Opportunity.AccountId = :accId];
    System.debug('Total items: ' + items.size());
    for (OpportunityLineItem item : items) {
        System.debug('Opp: ' + item.Opportunity.Name + ' | Product: ' + item.Product2.Name + ' | Price: ' + item.UnitPrice);
    }
} else {
    System.debug('No Aravind found');
}
