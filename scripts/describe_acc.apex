Map<String, SObjectField> fields = Account.SObjectType.getDescribe().fields.getMap();
for (String fieldName : fields.keySet()) {
    if (fieldName.contains('Gender') || fieldName.contains('Name') || fieldName.contains('Father') || fieldName.contains('Mother')) {
        System.debug('Field: ' + fieldName);
    }
}
