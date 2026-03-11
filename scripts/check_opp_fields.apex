Map<String, SObjectField> fields = Opportunity.SObjectType.getDescribe().fields.getMap();
for (String f : fields.keySet()) {
    if (f.containsIgnoreCase('Academic')) {
        System.debug('FEE_FIELD: ' + f + ' TYPE: ' + fields.get(f).getDescribe().getType());
    }
}
