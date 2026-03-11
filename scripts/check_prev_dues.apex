List<PricebookEntry> pbes = [SELECT Id, Pricebook2.Name FROM PricebookEntry WHERE Product2.ProductCode = 'PREV_DUES' AND IsActive = true];
for (PricebookEntry pbe : pbes) {
    System.debug('PBE: ' + pbe.Pricebook2.Name);
}
