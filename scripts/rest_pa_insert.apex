HttpRequest req = new HttpRequest();
req.setEndpoint(Url.getOrgDomainUrl().toExternalForm() + '/services/data/v65.0/sobjects/Account');
req.setMethod('POST');
req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
req.setHeader('Content-Type', 'application/json');
// Send FirstName and LastName for true PA
req.setBody('{"FirstName":"RestFront", "LastName":"RestBack", "RecordTypeId":"012f6000000zlGXAAY", "Class__c":"Nursery", "Section__c":"A"}');

Http http = new Http();
HttpResponse res = http.send(req);
System.debug('Status: ' + res.getStatusCode());
System.debug('Body: ' + res.getBody());
