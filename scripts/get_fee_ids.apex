Map<String, Id> feeMap = new Map<String, Id>();
for (PricebookEntry pbe : [SELECT Id, Product2.Name FROM PricebookEntry WHERE IsActive = true AND Pricebook2.IsStandard = true]) {
    if (pbe.Product2.Name == 'Admission Fee') feeMap.put('Admission Fee', pbe.Id);
    if (pbe.Product2.Name == 'Tuition Fee' || pbe.Product2.Name == 'Tuition fees') feeMap.put('Tuition Fee', pbe.Id);
    if (pbe.Product2.Name == 'School Uniform') feeMap.put('School Uniform', pbe.Id);
    if (pbe.Product2.Name == 'Text Books' || pbe.Product2.Name == 'Books fee') feeMap.put('Books fee', pbe.Id);
    if (pbe.Product2.Name == 'sports fee') feeMap.put('sports fee', pbe.Id);
}
for (String key : feeMap.keySet()) {
    System.debug('FEE_MAP: ' + key + ' => ' + feeMap.get(key));
}
