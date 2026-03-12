Schema.DescribeSObjectResult dr = Account.SObjectType.getDescribe();
System.debug('Is Person Account Enabled: ' + dr.fields.getMap().containsKey('IsPersonAccount'));
System.debug('Account Fields: ' + dr.fields.getMap().keySet());
