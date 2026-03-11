for(Opportunity o : [SELECT Id, Academic_Year__c FROM Opportunity WHERE Class__c = 'Nursery' ORDER BY CreatedDate DESC LIMIT 5]) {
    System.debug('DEBUG_OPP: ' + o.Id + ' AY: ' + o.Academic_Year__c);
}
