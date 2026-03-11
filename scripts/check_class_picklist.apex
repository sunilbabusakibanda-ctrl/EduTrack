for (Schema.PicklistEntry f : Account.Class__c.getDescribe().getPicklistValues()) {
    System.debug('--PICKLIST--' + f.getValue());
}
